"use client";
import React, { useState } from "react";
import { useToast } from "../ui/use-toast";
import { nanoid } from "nanoid";
import { AppNode } from "../nodes";
import { usePanel } from "@/context/panel";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { isValidYoutubeUrl } from "@/lib/utils";

interface Props {
  youtubeVideoUrl: string;
}
const useAddYoutubeNode = ({ youtubeVideoUrl }: Props) => {
  const { toast } = useToast();
  const { addNode, updateNode } = usePanel();
  const [isYoutubeNodeLoading, setIsYoutubeNodeLoading] = useState(false);

  const getVideoInfo = useMutation({
    mutationFn: ({ url }: { url: string }) =>
      axios.post("/api/yt/info", { url }),
  });

  const getYoutubeVideoTranscript = useMutation({
    mutationFn: ({ url }: { url: string }) =>
      axios.post("/api/yt/transcript", { url }),
  });

  const indexYoutubeVideo = useMutation({
    mutationFn: ({ url }: { url: string }) =>
      axios.post("/api/yt/index", { url }),
  });

  const handleYoutubeVideoUrlSubmit = async () => {
    setIsYoutubeNodeLoading(true);
    if (!isValidYoutubeUrl(youtubeVideoUrl)) {
      toast({
        title: "Invalid youtube URL",
      });
      return;
    }
    const id = nanoid();
    const newNode: AppNode = {
      position: { x: 0, y: 0 },
      id,
      width: 300,
      height: 150,
      data: {
        type: "youtubeNode",
        url: youtubeVideoUrl,
        description: "",
        title: "Making Title...",
        namespace: "",
        text: "",
      },
      type: "youtubeNode",
    };
    addNode(newNode);
    setIsYoutubeNodeLoading(false);
    try {
      const { data } = await getVideoInfo.mutateAsync({ url: youtubeVideoUrl });

      const {
        data: { transcript },
      } = await getYoutubeVideoTranscript.mutateAsync({ url: youtubeVideoUrl });
      if (!data.success) {
        alert("Failed to get video Info");
        return;
      }
      updateNode({
        id,
        type: "youtubeNode",
        data: {
          title: data.title,
          description: data.description,
          text: transcript,
        },
      });
      const {
        data: { namespace, success },
      } = await indexYoutubeVideo.mutateAsync({ url: youtubeVideoUrl });
      if (!success) {
        alert("Failed to index video");
        return;
      }
      updateNode({ id, type: "youtubeNode", data: { namespace } });
    } catch (error: any) {
      console.log("Something went wrong!", error);
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsYoutubeNodeLoading(false);
    }
  };

  return {
    handleYoutubeVideoUrlSubmit,
    setIsYoutubeNodeLoading,
    isYoutubeNodeLoading,
  };
};

export default useAddYoutubeNode;
