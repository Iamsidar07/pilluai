import { Context, Hono } from "hono";
import { getContextFromVectorStore } from "@/lib/vectorStore";
import { streamText } from "ai";
import { authMiddleware } from "../authMiddleware";
import { google } from "@ai-sdk/google";
import { addMessageToDb } from "@/lib/db";

export const chatHandler = async (c: Context) => {
  await authMiddleware(c);

  const { messages, knowledgeBaseNodes, boardId, nodeId, currentChat } =
    await c.req.json();

  // @ts-ignore
  const { userId } = c.user;

  const lastMessage = messages[messages.length - 1];
  const { namespaceNodes, imageNodes, textNodes } =
    categorizeNodes(knowledgeBaseNodes);

  const imagePrompt = imageNodes.map((node) => ({
    type: "image",
    image: node.data.base64,
  }));
  const namespacePromises = namespaceNodes.map((node) =>
    getContextFromVectorStore(node.data.namespace, lastMessage.content),
  );
  const textContents = textNodes.map((node) => node.data.text);

  const contexts = [
    ...(await Promise.all(namespacePromises)),
    ...textContents,
  ].join("\n");

  const prompt = createPrompt(lastMessage.content, contexts, imagePrompt);

  try {
    const result = await streamText({
      model: google("models/gemini-1.5-flash-latest"),
      system: `Answer the user's question based on the context. Do not use the word context.`,
      messages: [...messages, { role: "user", content: prompt }],
      onFinish: async ({ text }) => {
        await handleChatFinish(
          userId,
          boardId,
          nodeId,
          currentChat,
          lastMessage.content,
          text,
        );
      },
    });
    return result.toAIStreamResponse();
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
};

const categorizeNodes = (nodes) => {
  const namespaceNodes = [],
    imageNodes = [],
    textNodes = [];
  nodes.forEach((node) => {
    switch (node.type) {
      case "youtubeNode":
      case "webScrapperNode":
      case "pdfNode":
        namespaceNodes.push(node);
        break;
      case "imageNode":
        imageNodes.push(node);
        break;
      case "textNode":
        textNodes.push(node);
        break;
    }
  });
  return { namespaceNodes, imageNodes, textNodes };
};

const createPrompt = (lastMessageContent, contexts, imagePrompt) => {
  return [
    {
      type: "text",
      text: `<question>${lastMessageContent}</question><context>${contexts}</context>`,
    },
    ...imagePrompt,
  ];
};

const handleChatFinish = async (
  userId: string,
  boardId: string,
  nodeId: string,
  currentChat: { id: string },
  userContent: string,
  assistantResponse: string,
) => {
  await addMessageToDb(
    userId,
    boardId,
    nodeId,
    currentChat.id,
    "user",
    userContent,
  );
  await addMessageToDb(
    userId,
    boardId,
    nodeId,
    currentChat.id,
    "assistant",
    assistantResponse,
  );
};
