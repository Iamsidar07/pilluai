"use server";
import { embeddings, index } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { nanoid } from "nanoid";

const generateEmbeddings = async (url: string) => {
  auth().protect();
  try {
    const namespace = nanoid();
    const res = await fetch(url);
    const blob = await res.blob();
    const loader = new PDFLoader(blob);
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocs = await splitter.splitDocuments(docs);
    const vectorStore = new UpstashVectorStore(embeddings, {
      namespace,
      index,
    });
    await vectorStore.addDocuments(splitDocs);
    console.log("Stored docs in Upstash", namespace);
    return { success: true, namespace };
  } catch (e) {
    return { success: false };
  }
};

export default generateEmbeddings;
