import { NextRequest, NextResponse } from "next/server";
import { CohereEmbeddings } from "@langchain/cohere";
import { Index } from "@upstash/vector";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { nanoid } from "nanoid";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { isValidYoutubeUrl } from "@/lib/utils";

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
  if (!isValidYoutubeUrl(url)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid YouTube URL",
      },
      { status: 400 },
    );
  }
  const userId = "123";
  const namespace = nanoid();
  try {
    const loader = YoutubeLoader.createFromUrl(url, {
      addVideoInfo: true,
    });
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
    return NextResponse.json(
      {
        success: true,
        namespace,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
};
