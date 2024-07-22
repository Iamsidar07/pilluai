import { NextRequest, NextResponse } from "next/server";
import { CohereEmbeddings } from "@langchain/cohere";
import { Index } from "@upstash/vector";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { nanoid } from "nanoid";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";

const index = new Index({
  url: process.env.UPSTASH_INDEX_URL as string,
  token: process.env.UPSTASH_API_KEY as string,
});

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERENCE_API_KEY as string,
  batchSize: 48,
});

export const POST = async (req: NextRequest) => {
  const { url } = await req.json();
  const userId = "123";
  const namespace = nanoid();
  try {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    const docsWithMetadata = docs.map((doc) => ({
      ...doc,
      metadata: { ...doc.metadata, userId },
    }));
    const vectorStore = new UpstashVectorStore(embeddings, {
      namespace,
      index,
    });
    await vectorStore.addDocuments(docsWithMetadata);
    console.log("Stored docs in Upstash", namespace);
    return NextResponse.json({
      success: true,
      namespace,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
};
