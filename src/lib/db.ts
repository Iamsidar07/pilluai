import { nanoid } from "nanoid";
import { adminDb } from "@/firebaseAdmin";

export const addMessageToDb = async (
  userId: string,
  boardId: string,
  nodeId: string,
  chatId: string,
  role: string,
  content: string,
) => {
  await adminDb
    .collection("users")
    .doc(userId)
    .collection("boards")
    .doc(boardId)
    .collection("chatNodes")
    .doc(nodeId)
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .add({
      id: nanoid(),
      role,
      content,
      createdAt: new Date(),
    });
};
