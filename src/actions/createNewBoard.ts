"use server";

import { db } from "@/firebase";
import { Timestamp, addDoc, collection, getDocs } from "firebase/firestore";
import { maxFreeBoards } from "@/lib/config";
import { auth } from "@clerk/nextjs/server";

const createNewBoard = async (name: string) => {
  auth().protect();
  const { userId } = auth();
  if (!userId) {
    return { success: false, message: "You are not signed in." };
  }
  try {
    const boards = await getDocs(collection(db, `users/${userId}/boards`));
    if (boards.size >= maxFreeBoards) {
      return {
        success: false,
        message: "You have reached the maximum number of boards.",
      };
    }
    // LIMIT the boards
    await addDoc(collection(db, `users/${userId}/boards`), {
      nodes: [],
      edges: [],
      notes: "",
      name: name || "",
      createdAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.log("Failed to create new board.", error);
    return { success: false };
  }
};

export default createNewBoard;
