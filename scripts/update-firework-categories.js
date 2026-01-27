// Updates Firestore product categories to match combined-size tab names.
const { getApps, initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function getAdminDb() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey })
    });
  }

  return getFirestore();
}

const CATEGORY_MAP = {
  '4inch firework series': '4inch & 5inch firework series',
  '8inch firework series': '8inch & 9inch firework series'
};

async function run() {
  const db = getAdminDb();
  const snapshot = await db.collection('products').get();

  const updates = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const nextCategory = CATEGORY_MAP[data.category] || data.category;
    const nextSubcategory = CATEGORY_MAP[data.subcategory] || data.subcategory;

    if (nextCategory !== data.category || nextSubcategory !== data.subcategory) {
      updates.push({ id: doc.id, ref: doc.ref, category: nextCategory, subcategory: nextSubcategory });
    }
  });

  console.log(`Found ${updates.length} products to update.`);
  if (updates.length === 0) return;

  const batchSize = 500;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = db.batch();
    updates.slice(i, i + batchSize).forEach((item) => {
      batch.update(item.ref, {
        category: item.category,
        subcategory: item.subcategory,
        updatedAt: new Date()
      });
    });
    await batch.commit();
    console.log(`Committed batch ${i / batchSize + 1}`);
  }
}

run().catch((error) => {
  console.error('Failed to update categories:', error);
  process.exit(1);
});
