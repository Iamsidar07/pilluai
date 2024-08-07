"use client";

import getVideoTranscription from "@/actions/getVideoTranscription";
import getYoutubeVideoInfo from "@/actions/getYoutubeVideoInfo";
import storeYoutubeVideoEmbeddings from "@/actions/storeYoutubeVideoEmbeddings";
import { TYoutubeNode } from "@/components/nodes";
import { usePanel } from "@/context/panel";
import { isValidYoutubeUrl } from "@/lib/utils";
import { nanoid } from "nanoid";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

const useYoutubeNode = () => {
  const { addNode, updateNode } = usePanel();
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
        position: { x: 0, y: 0 },
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
      const { success: isTranscriptionSuccess, text } =
        await getVideoTranscription(videoUrl);
      if (!isTranscriptionSuccess) {
        toast.error("Failed to get transcription.");
      }
      const { success: isEmbeddingsFailed, namespace } =
        await storeYoutubeVideoEmbeddings(videoUrl);
      if (!isEmbeddingsFailed) {
        toast.error("Failed to index video.");
        return;
      }
      updateNode({
        id: node.id,
        type: "youtubeNode",
        data: {
          namespace,
          text,
        },
      });
    });
  };
  return { handleSubmit, videoUrl, setVideoUrl, open, setOpen, isPending };
};
export default useYoutubeNode;
