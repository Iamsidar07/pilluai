import { NextRequest } from "next/server";
import { CoreMessage, ImagePart, Message, streamText, UserContent } from "ai";
import { AppNode } from "@/components/nodes";
import { google } from "@ai-sdk/google";

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
    // @ts-ignore
    const text = knowledgeBaseNodes?.map((node) => node.data.text).join("\n");
    console.log("text", text);
    const lastMessage = messages[messages?.length - 1];
    const imageAndWebScraperNodes = knowledgeBaseNodes.filter(
      (node) => node.type === "imageNode" || node.type === "webScrapperNode",
    );
    const imagePrompt = imageAndWebScraperNodes.map((node) => {
      if (node.type === "webScrapperNode") {
        return {
          type: "image",
          image: node.data.screenshotUrl as string,
        } as ImagePart;
      }
      // @ts-ignore
      return { type: "image", image: node.data.url as string } as ImagePart;
    });

    const prompt: UserContent = [
      {
        type: "text",
        text: `
        <question>
        ${lastMessage.content}
        </question>
        <context>
        ${text}
        </context>
        `,
      },
      ...imagePrompt,
    ];

    const formatCoreMessage = (messages: Message[]) =>
      messages.map(
        (msg) => ({ role: msg.role, content: msg.content }) as CoreMessage,
      );

    const result = await streamText({
      model: google("models/gemini-1.5-flash-latest"),
      system: `
        You are an AI assistant who helps people find answers to their questions based on the given context. The context may includes text, images, and YouTube video transcriptions. Use all provided information to provide a comprehensive response.
        - Answer questions based on the context.
        - Reference images when relevant.
        - Integrate transcriptions and text seamlessly into your answers.
        - Be friendly and engaging.
      `,
      messages: [
        ...formatCoreMessage(messages),
        { role: "user", content: prompt },
      ],
      onFinish: async ({ text }) => {},
    });
    return result.toAIStreamResponse();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
