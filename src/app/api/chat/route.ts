import { NextRequest } from "next/server";
import { CoreMessage, Message, streamText } from "ai";
import { AppNode } from "@/components/nodes";
import { google } from "@ai-sdk/google";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { nanoid } from "nanoid";

export const POST = async (req: NextRequest) => {
  try {
    const {
      messages,
      namespace = "default",
      action,
      actionId,
      knowledgeBaseNodes,
      node,
      nodeId,
      responseMode,
      userId,
      chatId,
      messagesId,
    }: {
      messages: Message[];
      namespace?: string;
      node: AppNode;
      action: string;
      actionId: string;
      knowledgeBaseNodes: AppNode[];
      nodeId: string;
      responseMode: string;
      userId: string;
      chatId: string;
      messagesId: string;
    } = await req.json();
    const text = knowledgeBaseNodes?.map((node) => node.data.text).join("\n");
    console.log("text", text);
    const lastMessage = messages[messages?.length - 1];

    const prompt = `
        <question>
        ${lastMessage.content}
        </question>
        <context>
        ${text}
        </context>
        `;

    const formatCoreMessage = (messages: Message[]) =>
      messages.map(
        (msg) => ({ role: msg.role, content: msg.content }) as CoreMessage,
      );

    const result = await streamText({
      model: google("models/gemini-1.5-flash-latest"),
      system:
        "You are cool dude who helps people to find answers to their questions based on their given context",
      messages: [
        ...formatCoreMessage(messages),
        { role: "user", content: prompt },
      ],
      onFinish: async ({ text }) => {
        // try {
        //   const messagesCollectionRef = doc(
        //     db,
        //     "chats",
        //     chatId,
        //     "messages",
        //     messagesId,
        //   );
        //   const newAssistantMessage: Message = {
        //     id: nanoid(),
        //     role: "assistant",
        //     createdAt: new Date(),
        //     content: text,
        //   };
        //   // Add a new message document
        //   await updateDoc(messagesCollectionRef, {
        //     chatId,
        //     userId,
        //     messages: arrayUnion(lastMessage, newAssistantMessage),
        //   });
        // } catch (error) {
        //   console.log("Failed to save message", error);
        // }
      },
    });
    return result.toAIStreamResponse();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
