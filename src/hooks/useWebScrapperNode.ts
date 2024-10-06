"use client";

import { usePanel } from "@/context/panel";
import { isValidURL } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

const useWebScrapperNode = (nodeId: string) => {
  const { userId } = useAuth();
  const { updateNode } = usePanel();
  const [url, setUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  const updateWebScrapperNode = useCallback(
    (data: {}) => {
      updateNode({
        id: nodeId,
        type: "webScrapperNode",
        data,
      });
    },
    [nodeId, updateNode],
  );

  const handleAddWebscrapperNode = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isPending) return;
      if (!isValidURL(url)) {
        toast.error("Please enter a valid url");
        return;
      }
      startTransition(async () => {
        try {
          const scrapedResponse = await axios.post("/api/scrape", { url });
          updateWebScrapperNode({
            url,
            title: scrapedResponse.data.title,
            screenshotUrl: scrapedResponse.data.imageURL,
            text: scrapedResponse.data.content,
            metadata: `This is a Website. Title: ${scrapedResponse.data.title},Type: webScrapperNode, URL: ${url},`,
          });
          const embeddingResponse = await axios.post(
            "/api/generateEmbeddings",
            {
              url,
              type: "website",
            },
          );
          updateWebScrapperNode({
            namespace: embeddingResponse.data?.namespace,
          });
        } catch (error: any) {
          console.log("error:", error);
          toast.error("Something went wrong");
        }
      });
    },
    [updateWebScrapperNode, url, isPending],
  );

  return { handleAddWebscrapperNode, url, setUrl, isLoading: isPending };
};

export default useWebScrapperNode;
