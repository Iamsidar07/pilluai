import { NextRequest, NextResponse } from "next/server";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { nanoid } from "nanoid";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {
  embeddings,
  getLoader,
  index,
  isNamespaceExists,
} from "@/lib/langchain";
import ytdl from "ytdl-core";

export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  try {
    const { url, type } = await req.json();
    const namespace = type === "youtube" ? ytdl.getVideoID(url) : nanoid();

    // Check namespace existence and prepare loader in parallel
    const [namespaceExists, loader] = await Promise.all([
      isNamespaceExists(namespace, index),
      getLoader({ url, type })
    ]);

    if (namespaceExists) {
      return NextResponse.json({ namespace }, { status: 200 });
    }

    // Load docs and prepare text splitter in parallel
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkOverlap: 200,
      chunkSize: 1000,
    });
    const docs = await loader.load();

    // Split documents and initialize vector store in parallel
    const [splits, vectorStore] = await Promise.all([
      textSplitter.splitDocuments(docs),
      Promise.resolve(new UpstashVectorStore(embeddings, {
        namespace,
        index,
      }))
    ]);

    await vectorStore.addDocuments(splits);

    return NextResponse.json({ namespace }, { status: 201 });
  } catch (error: any) {
    console.log("failed embedding...", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
