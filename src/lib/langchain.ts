import { MistralAIEmbeddings } from "@langchain/mistralai";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { Index } from "@upstash/vector";
import ytdl from "ytdl-core";

export type LoaderType = "website" | "pdf" | "youtube";

interface LoaderArgs {
  url: string;
  type: LoaderType;
}

export const embeddings = new MistralAIEmbeddings({
  apiKey: process.env.MISTRAL_API_KEY,
});

export const index = new Index({
  url: process.env.UPSTASH_INDEX_URL,
  token: process.env.UPSTASH_API_KEY,
});

export const getLoader = async ({ url, type }: LoaderArgs) => {
  switch (type) {
    case "website":
      return new CheerioWebBaseLoader(url);
    case "pdf":
      const response = await fetch(url);
      const blob = await response.blob();
      return new PDFLoader(blob, {
        splitPages: true,
      });
    case "youtube":
      return new YoutubeLoader({
        videoId: ytdl.getURLVideoID(url),
        addVideoInfo: true,
      });
    default:
      throw "Invalid type";
  }
};

export const isNamespaceExists = async (namespace: string, index: Index) => {
  if (!namespace) throw new Error("Namespace not found");
  const allNamespaces = await index.listNamespaces();
  const result = allNamespaces.find((ns) => ns === namespace);
  return !!result;
};
