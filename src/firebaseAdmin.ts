import { initializeApp, getApp, getApps, App, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app: App;
// Decode the base64 encoded service key
const serviceKeyBase64 = process.env.SECRET_KEY_JSON;
if (!serviceKeyBase64) {
  throw new Error("Missing SECRET_KEY_JSON environment variable");
}
const serviceKeyJson = Buffer.from(serviceKeyBase64, "base64").toString(
  "utf-8"
);
const serviceKey = JSON.parse(serviceKeyJson);

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceKey),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);

export { adminDb, app as adminApp };
