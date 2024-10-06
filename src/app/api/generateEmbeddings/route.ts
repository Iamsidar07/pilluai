import { NextRequest, NextResponse } from "next/server";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { nanoid } from "nanoid";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {
  embeddings,
  getLoader,
  index,
  isNamespaceExists,
  LoaderType,
} from "@/lib/langchain";
import ytdl from "ytdl-core";

export const runtime = "nodejs";

async function getNamespaceByUrl(
  url: string,
  type: LoaderType
): Promise<string | null> {
  // const res = await index.query({
  //   filter: `url = ${url}`,
  //   topK: 1,
  //   data: "",
  // });
  // console.log(res);
  // youtube
  // For youtube I have to check by videoid
  // website
  // pdf
  return "";
}

export const POST = async (req: NextRequest) => {
  try {
    const { url, type } = await req.json();
    const existingNamespace = await getNamespaceByUrl(url, type);
    if (existingNamespace) {
      return NextResponse.json(
        { namespace: existingNamespace },
        { status: 200 }
      );
    }
    // return NextResponse.json("hello");

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
    return NextResponse.json({ namespace }, { status: 201 });
  } catch (error: any) {
    console.log("failed embedding...", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
