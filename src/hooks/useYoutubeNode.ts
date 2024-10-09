"use client";
import { TYoutubeNode } from "@/components/nodes";
import { usePanel } from "@/context/panel";
import { getNewNodePosition, isValidYoutubeUrl } from "@/lib/utils";
import axios from "axios";
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
      try {
        const [videoInfo, embedding] = await Promise.all([
          axios.post("/api/yt", { url: videoUrl }),
          axios.post("/api/generateEmbeddings", {
            url: videoUrl,
            type: "youtube",
          }),
        ]);
        const node: TYoutubeNode = {
          id: nanoid(),
          position: getNewNodePosition(nodes),
          type: "youtubeNode",
          data: {
            url: videoUrl,
            type: "youtubeNode",
            namespace: "",
            title: videoInfo.data.videoDetails.title,
            text: videoInfo.data.transcription,
            metadata: `This is an Youtube video. Type: youtubeVideo, Title: ${videoInfo.data.videoDetails.title}, URL: ${videoUrl}`,
          },
        };
        addNode(node);
        setOpen(false);
        updateNode({
          id: node.id,
          type: "youtubeNode",
          data: {
            namespace: embedding.data.namespace,
          },
        });
      } catch (error) {
        toast.error("Something went wrong.");
        console.log("Failed to add yt node: ", error);
      } finally {
        setOpen(false);
      }
    });
  };
  return { handleSubmit, videoUrl, setVideoUrl, open, setOpen, isPending };
};
export default useYoutubeNode;
