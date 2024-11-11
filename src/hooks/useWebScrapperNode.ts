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
    (data: Partial<{
      url: string;
      title: string;
      screenshotUrl: string;
      text: string;
      metadata: string;
      namespace: string;
    }>) => {
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
      
      if (isPending) {
        toast.info("Please wait while processing previous request");
        return;
      }

      if (!isValidURL(url)) {
        toast.error("Please enter a valid URL");
        return;
      }

      startTransition(async () => {
        try {
          // First scrape the website
          const scrapedResponse = await axios.post("/api/scrape", { url });
          const { title, imageURL: screenshotUrl, content } = scrapedResponse.data;

          // Update node with scraped data first for better UX
          updateWebScrapperNode({
            url,
            title,
            screenshotUrl,
            text: content,
            metadata: `This is a Website. Title: ${title}, Type: webScrapperNode, URL: ${url}`,
          });

          // Then generate embeddings
          const embeddingResponse = await axios.post("/api/generateEmbeddings", {
            url,
            type: "website",
          });

          // Update with namespace
          updateWebScrapperNode({
            namespace: embeddingResponse.data?.namespace,
          });

          toast.success("Website scraped successfully");
        } catch (error) {
          console.error("Failed to scrape website:", error);
          toast.error(
            error instanceof Error 
              ? error.message 
              : "Failed to scrape website. Please try again."
          );
        }
      });
    },
    [updateWebScrapperNode, url, isPending],
  );

  return { handleAddWebscrapperNode, url, setUrl, isLoading: isPending };
};

export default useWebScrapperNode;
