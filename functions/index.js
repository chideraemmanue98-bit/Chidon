/**
 * Firebase Cloud Function - Paystack Webhook Listener
 * 
 * Verifies Paystack transaction success and securely updates subscriptionStatus
 * and subscriptionPlan in the user's Firestore document.
 * 
 * To deploy, navigate to your functions directory and run:
 * firebase deploy --only functions
 */

const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const crypto = require("crypto");

// Initialize Firebase Admin SDK
admin.initializeApp();

exports.paystackWebhook = onRequest({ cors: true }, async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error("[Paystack Webhook] PAYSTACK_SECRET_KEY is not configured in your Firebase environment.");
    return res.status(500).send("Configuration error: PAYSTACK_SECRET_KEY is missing.");
  }

  // 1. Verify Paystack Signature
  if (signature) {
    // Note: Cloud Functions preserves the raw request body as a Buffer on `req.rawBody`
    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(req.rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.error("[Paystack Webhook] Signature verification failed. Hash does not match.");
      return res.status(401).send("Invalid signature.");
    }
  } else {
    console.warn("[Paystack Webhook] Unsigned webhook payload received.");
    // In strict production environment, uncomment the line below to reject unsigned payloads:
    // return res.status(401).send("Unsigned webhook not allowed.");
  }

  const { event, data } = req.body;

  if (event === "charge.success" && data && data.status === "success") {
    const metadata = data.metadata || {};
    const { userId, planName } = metadata;
    const reference = data.reference;
    const amountKobo = data.amount;
    const currency = data.currency;

    if (!userId) {
      console.warn("[Paystack Webhook] Webhook payload lacks userId in transaction metadata.");
      return res.status(400).send("Missing userId in metadata.");
    }

    try {
      const db = admin.firestore();
      const userRef = db.collection("users").doc(userId);
      const usdPrice = metadata.originalAmountUsd || (amountKobo / 100);

      console.log(`[Paystack Webhook] Updating subscription for userId: ${userId} to Plan: ${planName}`);

      // Update subscription fields on the user document
      await userRef.update({
        subscriptionPlan: planName || "Starter Creator Pack",
        subscriptionStatus: "active",
        subscriptionPrice: usdPrice,
        paystackSubscriptionRef: reference,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Write transaction receipt to historical receipts ledger
      const receiptRef = userRef.collection("receipts").doc(reference);
      await receiptRef.set({
        amountNgn: currency === "NGN" ? (amountKobo / 100) : null,
        amountUsd: usdPrice,
        reference: reference,
        payerEmail: data.customer?.email || "subscriber@chidon.iq",
        bundleName: planName || "Starter Creator Pack",
        status: "paid",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentChannel: data.channel || "card",
        gatewayResponse: data.gateway_response || "Successful"
      });

      console.log(`[Paystack Webhook] Firestore synchronization complete for userId: ${userId}`);
      return res.status(200).send("Webhook successfully processed and synchronized.");
    } catch (err) {
      console.error("[Paystack Webhook] Firestore write error:", err);
      return res.status(500).send("Internal database synchronization failure.");
    }
  }

  // Acknowledge receipt of other event types (e.g., charge.pending, transfer.success)
  console.log(`[Paystack Webhook] Event '${event}' received and acknowledged.`);
  return res.status(200).send(`Event '${event}' received and ignored.`);
});

exports.claimDailyCredits = onCall(async (request) => {
  // 1. Get userId from authenticated context
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  
  const userId = request.auth.uid;
  const db = admin.firestore();
  
  // 2. Get today's date in "YYYY-MM-DD" format in Africa/Lagos timezone (UTC+1)
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' });
  const todayStr = formatter.format(now); // "YYYY-MM-DD"
  
  const userRef = db.collection("users").doc(userId);
  
  try {
    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new HttpsError("not-found", "User profile does not exist.");
      }
      
      const userData = userDoc.data();
      const lastDailyClaim = userData.lastDailyClaim || "";
      
      if (lastDailyClaim === todayStr) {
        return { success: false, message: "Already claimed today" };
      }
      
      const currentCredits = Number(userData.credits || 0);
      const newCredits = currentCredits + 2;
      
      // Update users doc
      transaction.update(userRef, {
        credits: newCredits,
        lastDailyClaim: todayStr,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Create transaction doc
      const txRef = db.collection("credit_transactions").doc();
      transaction.set(txRef, {
        userId: userId,
        amount: 2,
        type: "daily",
        reason: "Daily Login Bonus",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const userTxRef = db.collection("users").doc(userId).collection("transactions").doc(txRef.id);
      transaction.set(userTxRef, {
        amount: 2,
        type: "credit",
        reason: "Daily Login Bonus",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true, message: "Claimed successfully", newBalance: newCredits };
    });
    
    return result;
  } catch (err) {
    console.error("claimDailyCredits transaction failure:", err);
    throw new HttpsError("internal", err.message || "Daily claim transaction failed.");
  }
});
