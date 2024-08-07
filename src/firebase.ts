import { initializeApp } from "firebase/app";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAnAyNBtaW0yqmoJi6h4CKWqFNKdQs_AeQ",
  authDomain: "pilluai.firebaseapp.com",
  projectId: "pilluai",
  storageBucket: "pilluai.appspot.com",
  messagingSenderId: "236981724857",
  appId: "1:236981724857:web:f8b217279c145d78181d68",
  measurementId: "G-E38B5P6PNN",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();
