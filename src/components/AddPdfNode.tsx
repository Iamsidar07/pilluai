"use client";
import React, { useCallback, useEffect, useRef } from "react";
import PanelItem from "./panels/PanelItem";
import { ImageIcon } from "lucide-react";
import { useKeyPress } from "@xyflow/react";
import { nanoid } from "nanoid";
import { TImageNode, TPdfNode } from "./nodes";
import { usePanel } from "@/context/panel";
import { toast } from "sonner";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/firebase";
import useCurrentUser from "@/context/currentUser";
import { FaRegFilePdf, FaRegFileImage } from "react-icons/fa";

const AddPdfNode = () => {
  const { user } = useCurrentUser();
  const { addNode, updateNode } = usePanel();
  const isIPressed = useKeyPress("p" || "P");

  const handleAddPdfNode = useCallback(() => {
    const newNode: TPdfNode = {
      position: { x: 0, y: 0 },
      id: nanoid(),
      initialWidth: 225,
      initialHeight: 175,
      data: {
        type: "pdfNode",
        url: "",
        name: "",
        namespace: "",
      },
      type: "pdfNode",
    };
    addNode(newNode);
  }, [addNode]);

  useEffect(() => {
    if (isIPressed) {
      handleAddPdfNode();
    }
  }, [handleAddPdfNode, isIPressed]);

  return (
    <PanelItem onClick={handleAddPdfNode} text="Pdf" shortcutKey="P">
      <FaRegFilePdf className="w-5 h-5" />
    </PanelItem>
  );
};

export default AddPdfNode;
