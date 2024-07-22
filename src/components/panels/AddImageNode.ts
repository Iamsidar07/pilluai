"use client";
import React from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { nanoid } from "nanoid";
import { AppNode } from "../nodes";
import { usePanel } from "@/context/panel";
import { useToast } from "../ui/use-toast";
const useAddImageNode = () => {
  const { addNode, updateNode } = usePanel();
  const { toast } = useToast();
  const { mutateAsync: uploadImage } = useMutation({
    mutationFn: ({ buffer }: { buffer: Buffer }) =>
      axios.post("/api/image/upload", {
        buffer,
      }),
  });

  const { mutateAsync: analyseImage } = useMutation({
    mutationFn: (url: string) =>
      axios.post("/api/image/analyse", {
        url,
      }),
  });

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length === 0 || !files) return;
    const file = files[0];
    const id = nanoid();
    const newNode: AppNode = {
      position: { x: 0, y: 0 },
      id,
      width: 515,
      height: 356,
      data: {
        type: "imageNode",
        url: "",
        description: "",
        text: "",
        title: "YOOO! Uploading...",
        tempUrl: URL.createObjectURL(file),
      },
      type: "imageNode",
    };

    try {
      addNode(newNode);
      const { data } = await uploadImage({
        buffer: Buffer.from(await files[0].arrayBuffer()),
      });
      updateNode({
        id,
        type: "imageNode",
        data: {
          title: file.name,
          url: data.url,
        },
      });
      const { data: imageInfo } = await analyseImage(data.url);
      updateNode({
        id,
        type: "imageNode",
        data: {
          title: imageInfo.title,
          description: imageInfo.description,
          text: imageInfo.description,
        },
      });
    } catch (error: any) {
      console.log("Something went wrong!", error);
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { handleSelectFile };
};
export default useAddImageNode;
