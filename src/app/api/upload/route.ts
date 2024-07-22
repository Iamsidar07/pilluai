import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CohereEmbeddings } from "@langchain/cohere";
import { Index } from "@upstash/vector";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/utils/supabase/server";

export const POST = async (req: NextRequest) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  const userId = data.user?.id;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const fileLink = formData.get("fileLink") as string | null;
  if (!file && !fileLink) return;
  const namespace = uuidv4();

  try {
    let loader: CheerioWebBaseLoader | PDFLoader;

    if (fileLink) {
      loader = new CheerioWebBaseLoader(fileLink, {
        timeout: 500000,
      });
    } else if (file) {
      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer], { type: "application/pdf" });
      loader = new PDFLoader(blob, {
        splitPages: true,
      });
      console.log("Uploading to S3");
      const { data, error } = await supabase.storage
        .from("pdf")
        .upload(namespace, file);
      if (error) throw error;
      console.log("Upload response", data.path);
    } else {
      throw new Error("No file or fileLink provided");
    }

    const index = new Index({
      token: process.env.UPSTASH_API_KEY as string,
      url: process.env.UPSTASH_INDEX_URL as string,
    });

    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERENCE_API_KEY as string,
      batchSize: 48,
    });

    const docs = await loader.load();

    const docMap = docs.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: {
        userId,
      },
    }));

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 100,
    });

    const splitDocs = await textSplitter.splitDocuments(docMap);

    const vectoreStore = new UpstashVectorStore(embeddings, {
      index,
      namespace,
    });

    await vectoreStore.addDocuments(splitDocs);

    return NextResponse.json({ namespace, success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error, success: false });
  }
};
