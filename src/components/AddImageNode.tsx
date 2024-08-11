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

const AddImageNode = () => {
  const { userId } = useAuth();
  const { addNode, updateNode } = usePanel();
  const isIPressed = useKeyPress("i" || "I");
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
      position: { x: 0, y: 0 },
      id: nanoid(),
      width: 300,
      height: 200,
      data: {
        type: "imageNode",
        url: "",
        title: "Uploading...",
        tempUrl: URL.createObjectURL(file),
        base64: "",
      },
      type: "imageNode",
    };

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      newNode.data.url = base64String; // Set the base64 string to the url field
      console.log("Base64 image string:", base64String);
      updateImageNode(newNode.id, {
        base64: base64String,
      });
    };
    reader.readAsDataURL(file);

    try {
      addNode(newNode);
      const imageRef = ref(storage, `users/${userId}/files/${nanoid()}`);
      const blob = await file.arrayBuffer();
      const uploadTask = await uploadBytesResumable(imageRef, blob);
      const url = await getDownloadURL(uploadTask.ref);
      console.log("from add image node", { url });
      updateImageNode(newNode.id, { url, tempUrl: null, title: file.name });
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
