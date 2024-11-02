"use client";
import React, { useCallback, useEffect, useRef } from "react";
import PanelItem from "./panels/PanelItem";
import { ImageIcon } from "lucide-react";
import { useKeyPress } from "@xyflow/react";
import { nanoid } from "nanoid";
import { TImageNode } from "./nodes";
import { usePanel } from "@/context/panel";
import { toast } from "sonner";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/firebase";
import { useAuth } from "@clerk/nextjs";
import { getNewNodePosition } from "@/lib/utils";
import axios from "axios";

const AddImageNode = () => {
  const { userId } = useAuth();
  const { addNode, updateNode, nodes } = usePanel();
  const isIPressed = useKeyPress("i");
  const selectImageRef = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    if (isIPressed && selectImageRef.current) {
      selectImageRef.current.click();
    }
  }, [isIPressed]);

  const updateImageNode = useCallback(
    (id: string, data: {}) => {
      updateNode({
        id,
        type: "imageNode",
        data,
      });
    },
    [updateNode]
  );

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length === 0 || !files || !userId) return;
    const file = files[0];
    console.log("adding image node", file);
    const newNode: TImageNode = {
      position: getNewNodePosition(nodes),
      id: nanoid(),
      width: 320,
      height: 200,
      data: {
        type: "imageNode",
        url: "",
        title: "Uploading...",
        tempUrl: URL.createObjectURL(file),
        base64: "",
        metadata: "",
        text: "",
      },
      type: "imageNode",
    };

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      newNode.data.url = base64String;
      updateImageNode(newNode.id, {
        base64: base64String,
      });
      addNode(newNode);
      const res = await axios.post("/api/generateMetadataForImage", {
        url: base64String,
      });
      console.log(res.data);
      updateImageNode(newNode.id, {
        tempUrl: null,
        title: res.data.title,
        text: res.data.description,
      });
    };
    reader.readAsDataURL(file);

    try {
      const imageRef = ref(storage, `users/${userId}/files/${nanoid()}`);
      const blob = await file.arrayBuffer();
      const uploadTask = await uploadBytesResumable(imageRef, blob);
      const url = await getDownloadURL(uploadTask.ref);
      console.log("from add image node", { url });
      updateImageNode(newNode.id, {
        url,
        tempUrl: null,
        metadata: `This is a Image. Title: ${newNode.data.title}, Type: imageNode, URL: ${url}`,
      });
    } catch (error: any) {
      console.log("Something went wrong!", error);
      toast.error("Something went wrong");
    }
  };
  return (
    <PanelItem text="Image" shortcutKey="I">
      <label ref={selectImageRef} htmlFor="selectImage">
        <ImageIcon />
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleSelectFile}
        className="hidden"
        id="selectImage"
      />
    </PanelItem>
  );
};

export default AddImageNode;
