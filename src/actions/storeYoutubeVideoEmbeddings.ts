"use server";

import { embeddings, index } from "@/lib/langchain";
import { isValidYoutubeUrl } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { nanoid } from "nanoid";

const storeYoutubeVideoEmbeddings = async (url: string) => {
  auth().protect();
  if (!isValidYoutubeUrl(url)) {
    return { success: false };
  }
  const namespace = nanoid();
  try {
    const loader = YoutubeLoader.createFromUrl(url, {
      addVideoInfo: true,
    });
    const docs = await loader.load();
    const vectorStore = new UpstashVectorStore(embeddings, {
      namespace,
      index,
    });
    await vectorStore.addDocuments(docs);
    console.log("Stored docs in Upstash", namespace);
    return { success: true, namespace };
  } catch (error) {
    return { success: false };
  }
};
export default storeYoutubeVideoEmbeddings;
