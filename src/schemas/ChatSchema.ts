import { z } from "zod";

export const ChatSchema = z.object({
  type: z.enum(["website", "youtube", "pdf"]),
  url: z.string(),
});

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  id: z.string(),
  createdAt: z.date().optional(),
});

const knowledgeBaseSchema = z.object({
  title: z.string(),
  url: z.string(),
});

export const ChatRequestBody = z.object({
  boardId: z.string(),
  nodeId: z.string(),
  messages: z.array(MessageSchema),
  knowledgeBase: z.array(knowledgeBaseSchema),
  currentChatId: z.string(),
});
