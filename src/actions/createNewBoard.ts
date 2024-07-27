"use server";

import { db } from "@/firebase";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { User } from "../../typing";

const createNewBoard = async (name: string, user: User) => {
  try {
    await addDoc(collection(db, "boards"), {
      nodes: [],
      edges: [],
      notes: "",
      name: name || "",
      userId: user.uid,
      userName: user.name || "",
      createdAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.log("Failed to create new board.", error);
    return { success: false };
  }
};

export default createNewBoard;
