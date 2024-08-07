"use server";

import { db } from "@/firebase";
import { auth } from "@clerk/nextjs/server";
import { doc, updateDoc } from "firebase/firestore";

const renameBoard = async (newBoardName: string, boardId: string) => {
  auth().protect();
  const { userId } = auth();
  try {
    await updateDoc(doc(db, `users/${userId}/boards/${boardId}`), {
      name: newBoardName,
    });
    return { success: true };
  } catch (error) {
    console.log("Failed to rename board.");
    return { success: false };
  }
};
export default renameBoard;
