"use server";

import { db } from "@/firebase";
import { Timestamp, addDoc, collection, getDocs } from "firebase/firestore";
import { User } from "../../typing";
import { maxFreeBoards } from "@/lib/config";

const createNewBoard = async (name: string, user: User) => {
  try {
    const boards = await getDocs(collection(db, `users/${user.uid}/boards`));
    if (boards.size >= maxFreeBoards) {
      return {
        success: false,
        message: "You have reached the maximum number of boards.",
      };
    }
    // LIMIT the boards
    await addDoc(collection(db, `users/${user.uid}/boards`), {
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
