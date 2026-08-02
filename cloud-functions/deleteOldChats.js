const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const admin = require("firebase-admin");

// Initialize Firebase Admin if not initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = getFirestore();

/**
 * Scheduled function to delete old chats every day at 3am.
 */
exports.deleteOldChats = onSchedule("0 3 * * *", async (event) => {
  console.log("Starting scheduled chat history purging protocol...");
  const now = Timestamp.now();

  try {
    // Query for all chat messages that have expired (expireAt < now) using collectionGroup.
    // This queries chats/{uid}/features/{featureId}/messages/{messageId} globally.
    const messagesRef = db.collectionGroup("messages");
    const expiredQuery = messagesRef.where("expireAt", "<", now);
    
    const snapshot = await expiredQuery.get();
    
    if (snapshot.empty) {
      console.log("No expired chat logs found. Purge complete.");
      return;
    }

    console.log(`Found ${snapshot.size} expired chat message documents. Initializing batch delete...`);

    const batchSize = 500;
    let batch = db.batch();
    let count = 0;
    let totalDeleted = 0;

    for (const docSnap of snapshot.docs) {
      batch.delete(docSnap.ref);
      count++;
      totalDeleted++;

      if (count === batchSize) {
        await batch.commit();
        console.log(`Committed deletion batch of ${count} documents.`);
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`Committed final deletion batch of ${count} documents.`);
    }

    console.log(`Successfully purged ${totalDeleted} expired chat logs from Firestore.`);
  } catch (error) {
    console.error("Purging protocol interrupted by fatal error:", error);
    throw error;
  }
});
