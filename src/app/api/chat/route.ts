import { AppNode, TImageNode, TPdfNode, TTextNode, TWebScrapperNode, TYoutubeNode } from "@/components/nodes";
import { adminDb } from "@/firebaseAdmin";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { CohereEmbeddings } from "@langchain/cohere";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { Index } from "@upstash/vector";
import {
    CoreMessage,
    ImagePart,
    Message,
    streamText,
    UserContent
} from "ai";
import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { Chat } from "../../../../typing";

const vectorStoreCache: Record<string, UpstashVectorStore> = {};
const index = new Index({
  url: process.env.UPSTASH_INDEX_URL as string,
  token: process.env.UPSTASH_API_KEY as string,
});

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERENCE_API_KEY as string,
  batchSize: 48,
});

async function getVectorStore(namespace: string) {
  if (!vectorStoreCache[namespace]) {
    vectorStoreCache[namespace] = await UpstashVectorStore.fromExistingIndex(
      embeddings,
      {
        index,
        namespace,
      }
    );
  }
  return vectorStoreCache[namespace];
}

async function getContextFromVectorStore(namespace: string, query: string) {
  const vectorStore = await getVectorStore(namespace);
  const results = await vectorStore.similaritySearch(query, 1);
  return results.map((doc) => doc.pageContent).join("\n");
}

export const POST = async (req: NextRequest) => {
  try {
    const {
      messages,
      knowledgeBaseNodes,
      boardId,
      nodeId,
      currentChat,
    }: {
      messages: Message[];
      knowledgeBaseNodes: AppNode[];
      boardId: string;
      nodeId: string;
      currentChat: Chat;
    } = await req.json();
    auth().protect();
    const { userId } = auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });
    const lastMessage = messages[messages?.length - 1];

    const namespaceNodes: (TYoutubeNode | TWebScrapperNode | TPdfNode)[] = [];
    const imageNodes: TImageNode[] = [];
    const textNodes: TTextNode[] = [];

    knowledgeBaseNodes.forEach((node) => {
      if (node.type === "chatNode") return;
      if (
        node.type === "youtubeNode" ||
        node.type === "webScrapperNode" ||
        node.type === "pdfNode"
      ) {
        namespaceNodes.push(node);
        
      } else if (node.type === "imageNode") {
        imageNodes.push(node);
      } else if (node.type === "textNode") {
        textNodes.push(node);
      }
    });

    const addMessageToDb = async (role: string, content: string) => {
      await adminDb
        .collection("users")
        .doc(userId)
        .collection("boards")
        .doc(boardId)
        .collection("chatNodes")
        .doc(nodeId)
        .collection("chats")
        .doc(currentChat.id)
        .collection("messages")
        .add({
          id: nanoid(),
          role,
          content,
          createdAt: new Date(),
        });
    };

    const imagePrompt = imageNodes?.map((node) => {
      return { type: "image", image: node.data.base64 as string } as ImagePart;
    });

    const namespacePromises = namespaceNodes?.map((node) =>
      getContextFromVectorStore(
        node.data.namespace,
        lastMessage.content
      )
    );

    const textContents = textNodes?.map((node) => node.data.text);

    const vectorResults = await Promise.all(namespacePromises);

    const contexts = [...vectorResults, ...textContents].join("\n");

    const prompt: UserContent = [
      {
        type: "text",
        text: `
        <question>
        ${lastMessage.content}
        </question>
        <context>
        ${contexts}
        </context>
        `,
      },
      ...imagePrompt,
    ];

    const result = await streamText({
      model: google("models/gemini-1.5-flash-latest"),
      system: `
        Answer the user's question based on the context. Do not use the word context.`,
      messages: [
        ...(messages as CoreMessage[]),
        { role: "user", content: prompt },
      ],
      onFinish: async ({ text }) => {
        try {
          const saveMessages = [
            addMessageToDb("user", lastMessage.content),
            addMessageToDb("assistant", text),
          ];
          await Promise.all(saveMessages);
          if (!currentChat.title) {
            console.log("Updating chat title...");
            adminDb
              .collection("users")
              .doc(userId)
              .collection("boards")
              .doc(boardId)
              .collection("chatNodes")
              .doc(nodeId)
              .collection("chats")
              .doc(currentChat.id)
              .update({
                title: lastMessage.content,
              });
          }
        } catch (error) {
          console.log("Failed to update chat title: ", error);
        }
      },
    });
    return result.toAIStreamResponse();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
