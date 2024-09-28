import { Hono } from "hono";
import { handle } from "hono/vercel";
import {
  AppNode,
  TImageNode,
  TPdfNode,
  TTextNode,
  TWebScrapperNode,
  TYoutubeNode,
} from "@/components/nodes";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { CoreMessage, ImagePart, Message, streamText, UserContent } from "ai";
import { nanoid } from "nanoid";
import { Chat } from "../../../../typing";
import { adminDb } from "@/firebaseAdmin";
import { getContextFromVectorStore } from "@/lib/vectorStore";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { embeddings, index } from "@/lib/langchain";
import { generateEmbeddingHandler } from "./routes/generateEmbedding";
import { chatHandler } from "./routes/chat";

export const dynamic = "force-dynamic";

const app = new Hono().basePath("/api");

app.post("/generateEmbedding", generateEmbeddingHandler);
app.post("/chat", chatHandler);

export const GET = handle(app);
export const POST = handle(app);
