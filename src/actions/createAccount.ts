"use server";

import { auth } from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

const createAccount = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
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

export default createAccount;
