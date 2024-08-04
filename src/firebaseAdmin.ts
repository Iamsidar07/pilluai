import { initializeApp, getApp, getApps, App, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app: App;
const service_key = require("../secret_key.json");

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(service_key),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);

export { adminDb, app as adminApp };
