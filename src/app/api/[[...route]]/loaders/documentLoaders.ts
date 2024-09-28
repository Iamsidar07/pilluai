import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export const loadDocuments = async (
  url: string,
  type: "website" | "youtubeVideo" | "pdf",
) => {
  let loader;
  switch (type) {
    case "website":
      loader = new CheerioWebBaseLoader(url);
      break;
    case "youtubeVideo":
      loader = new YoutubeLoader({ addVideoInfo: false, videoId: url });
      break;
    case "pdf":
      const res = await fetch(url);
      const blob = await res.blob();
      loader = new PDFLoader(blob);
      break;
    default:
      throw new Error("Unsupported type");
  }
  return loader.load();
};
