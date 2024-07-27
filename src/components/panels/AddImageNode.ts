"use client";
import React from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { nanoid } from "nanoid";
import { AppNode } from "../nodes";
import { usePanel } from "@/context/panel";
import { toast } from "sonner";

const useAddImageNode = () => {
  const { addNode, updateNode } = usePanel();
  const { mutateAsync: uploadImage } = useMutation({
    mutationFn: ({ buffer }: { buffer: Buffer }) =>
      axios.post("/api/image/upload", {
        buffer,
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
      width: 300,
      height: 200,
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
      // const { data: imageInfo } = await analyseImage(data.url);
      updateNode({
        id,
        type: "imageNode",
        data: {
          title: file.name,
          description: "",
          text: "",
        },
      });
    } catch (error: any) {
      console.log("Something went wrong!", error);
      toast.error("Something went wrong");
    }
  };

  return { handleSelectFile };
};
export default useAddImageNode;
