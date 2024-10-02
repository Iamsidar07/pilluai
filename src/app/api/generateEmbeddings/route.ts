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

export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  try {
    const { url, type } = await req.json();
    const namespace = nanoid();
    const loader = await getLoader({ url, type });
    const docs = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkOverlap: 200,
      chunkSize: 1000,
    });
    const splits = await textSplitter.splitDocuments(docs);
    let vectorStore: UpstashVectorStore;
    if (isNamespaceExists(namespace, index)) {
      vectorStore = await UpstashVectorStore.fromExistingIndex(embeddings, {
        index,
        namespace,
      });
    } else {
      vectorStore = new UpstashVectorStore(embeddings, {
        namespace,
        index,
      });
    }
    await vectorStore.addDocuments(splits);
  } catch (error: any) {
    console.log("failed embedding...");
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
