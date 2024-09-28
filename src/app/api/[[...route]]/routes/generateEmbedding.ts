import { Context, Hono } from "hono";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { nanoid } from "nanoid";
import { embeddings, index } from "@/lib/langchain";
import { loadDocuments } from "../loaders/documentLoaders";

export const generateEmbeddingHandler = async (c: Context) => {
  const { url, type } = await c.req.json();
  const namespace = nanoid();

  const docs = await loadDocuments(url, type);
  const vectorStore = new UpstashVectorStore(embeddings, { namespace, index });

  await vectorStore.addDocuments(docs);
  return c.json({ success: true, namespace });
};
