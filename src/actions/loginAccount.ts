"use server";

import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const loginAccount = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
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

export default loginAccount;
