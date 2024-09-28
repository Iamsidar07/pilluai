"use client";
import React, { useCallback, useEffect } from "react";
import PanelItem from "./panels/PanelItem";
import { useKeyPress, useReactFlow } from "@xyflow/react";
import { nanoid } from "nanoid";
import { TPdfNode } from "./nodes";
import { usePanel } from "@/context/panel";
import { FaRegFilePdf } from "react-icons/fa";
import { getNewNodePosition } from "@/lib/utils";

const AddPdfNode = () => {
  const { addNode, nodes } = usePanel();
  const isIPressed = useKeyPress("p" || "P");
  const { fitView } = useReactFlow();

  const handleAddPdfNode = useCallback(() => {
    const newNode: TPdfNode = {
      position: getNewNodePosition(nodes),
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
    fitView();
  }, [addNode, fitView]);

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
