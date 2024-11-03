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
    if (await isNamespaceExists(namespace, index)) {
      return NextResponse.json({ namespace }, { status: 200 });
    }
    const loader = await getLoader({ url, type });
    const docs = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkOverlap: 200,
      chunkSize: 1000,
    });
    const splits = await textSplitter.splitDocuments(docs);
    const vectorStore = new UpstashVectorStore(embeddings, {
      namespace,
      index,
    });
    await vectorStore.addDocuments(splits);

    return NextResponse.json({ namespace }, { status: 201 });
  } catch (error: any) {
    console.log("failed embedding...", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
