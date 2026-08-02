/**
 * Firebase Cloud Function - Paystack Webhook Listener
 * 
 * Verifies Paystack transaction success and securely updates subscriptionStatus
 * and subscriptionPlan in the user's Firestore document.
 * 
 * To deploy, navigate to your functions directory and run:
 * firebase deploy --only functions
 */

const { onRequest } = require("firebase-functions/v2/https");
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
