"use client";

import getYoutubeVideoInfo from "@/actions/getYoutubeVideoInfo";
import { TYoutubeNode } from "@/components/nodes";
import { usePanel } from "@/context/panel";
import { getNewNodePosition, isValidYoutubeUrl } from "@/lib/utils";
import { nanoid } from "nanoid";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

const useYoutubeNode = () => {
  const { addNode, updateNode, nodes } = usePanel();
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidYoutubeUrl(videoUrl)) {
      toast.error("Invalid video url.");
      return;
    }
    startTransition(async () => {
      const { success, description, title } =
        await getYoutubeVideoInfo(videoUrl);
      console.log(success, description, title);
      if (!success) {
        toast.error("Failed to get video details");
        return;
      }
      const node: TYoutubeNode = {
        id: nanoid(),
        position: getNewNodePosition(nodes),
        type: "youtubeNode",
        data: {
          url: videoUrl,
          type: "youtubeNode",
          namespace: "",
          title: title || "",
        },
      };
      addNode(node);
      setOpen(false);
      try {
        const { namespace, success: isEmbeddingsFailed } = await fetch(
          "/api/generateEmbedding",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: videoUrl,
              type: "youtubeVideo",
            }),
          },
        ).then((res) => res.json());

        if (!isEmbeddingsFailed) {
          toast.error("Failed to index video.");
          return;
        }
        updateNode({
          id: node.id,
          type: "youtubeNode",
          data: {
            namespace,
          },
        });
      } catch (error: any) {
        console.log(error);
        toast.error(error.message);
      }
    });
  };
  return { handleSubmit, videoUrl, setVideoUrl, open, setOpen, isPending };
};
export default useYoutubeNode;
