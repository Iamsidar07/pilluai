import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { embeddings, index } from "./ai";

const vectorStoreCache: Record<string, UpstashVectorStore> = {};

async function getVectorStore(namespace: string) {
  if (!vectorStoreCache[namespace]) {
    vectorStoreCache[namespace] = await UpstashVectorStore.fromExistingIndex(
      embeddings,
      {
        index,
        namespace,
      },
    );
  }
  return vectorStoreCache[namespace];
}

async function getContextFromVectorStore(namespace: string, query: string) {
  const vectorStore = await getVectorStore(namespace);
  const results = await vectorStore.similaritySearch(query, 5);
  console.log(
    "got vectorStore",
    results.map((doc) => doc.pageContent),
  );
  return results.map((doc) => doc.pageContent).join("\n");
}

export { getVectorStore, getContextFromVectorStore };
