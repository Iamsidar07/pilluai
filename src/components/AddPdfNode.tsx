"use client";
import React, { useCallback, useEffect } from "react";
import PanelItem from "./panels/PanelItem";
import { useKeyPress } from "@xyflow/react";
import { nanoid } from "nanoid";
import { TPdfNode } from "./nodes";
import { usePanel } from "@/context/panel";
import { FaRegFilePdf } from "react-icons/fa";

const AddPdfNode = () => {
  const { addNode } = usePanel();
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
