"use client";

import scrapeWebsite from "@/actions/scrapeWebsite";
import storeWebsiteEmbeddings from "@/actions/storeWebsiteEmbeddings";
import useCurrentUser from "@/context/currentUser";
import { usePanel } from "@/context/panel";
import { storage } from "@/firebase";
import { isValidURL } from "@/lib/utils";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const useWebScrapperNode = (nodeId: string) => {
  const { updateNode } = usePanel();
  const { user } = useCurrentUser();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateWebScrapperNode = useCallback(
    (data: {}) => {
      updateNode({
        id: nodeId,
        type: "webScrapperNode",
        data,
      });
    },
    [nodeId, updateNode]
  );

  const handleAddWebscrapperNode = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isValidURL(url)) {
        toast.error("Please enter a valid url");
        return;
      }
      try {
        setIsLoading(true);
        const scrapedData = await scrapeWebsite(url);
        if (!scrapedData?.success) {
          toast.error("Failed to scrape.");
          return;
        }
        updateWebScrapperNode({
          url,
          title: scrapedData.title,
          tempUrl: `data:image/png;base64,${scrapedData.base64}`,
        });
        const imageRef = ref(storage, `users/${user?.uid}/files/${nanoid()}`);
        const uploadTask = await uploadBytesResumable(
          imageRef,
          scrapedData.buffer as Buffer
        );
        const uploadedImageUrl = await getDownloadURL(uploadTask.ref);
        console.log("uploadedImage: ", uploadedImageUrl);
        const { namespace, success } = await storeWebsiteEmbeddings(url);
        if (!success) {
          toast.error("Failed to generate embedding.");
          return;
        }
        updateWebScrapperNode({
          screenshotUrl: uploadedImageUrl as string,
          tempUrl: null,
          namespace,
        });
      } catch (error: any) {
        console.log("error:", error);
        toast.error("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    },
    [updateWebScrapperNode, setIsLoading, url, user?.uid]
  );

  return { handleAddWebscrapperNode, url, setUrl, isLoading };
};

export default useWebScrapperNode;
