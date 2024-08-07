"use server";
import { embeddings, index } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { nanoid } from "nanoid";

const storeWebsiteEmbeddings = async (url: string) => {
  auth().protect();
  try {
    const namespace = nanoid();
    console.log("Storing embeddings for", url, "in namespace", namespace);
    const loader = new CheerioWebBaseLoader(url);
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

export default storeWebsiteEmbeddings;
