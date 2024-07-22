"use server";

import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export const createAccount = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  if (!email || !password || !name) {
    return { error: "All fields are required" };
  }
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
    await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: {
        name: res.user.displayName,
        email: res.user.email,
        photoURL: res.user.photoURL,
        uid: res.user.uid,
      },
    };
  } catch (e: any) {
    console.log("failed to create account", e);
    throw new Error(e.message);
  }
};
export const loginAccount = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!email || !password) {
    return { error: "All fields are required" };
  }
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: {
        name: res.user.displayName,
        email: res.user.email,
        photoURL: res.user.photoURL,
        uid: res.user.uid,
      },
    };
  } catch (e: any) {
    console.log("failed to login", e);
    return { success: false, error: e.message };
  }
};
