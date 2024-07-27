"use client";
import React, { useEffect } from "react";
import PanelItem from "./panels/PanelItem";
import { useKeyPress } from "@xyflow/react";
import { Globe } from "lucide-react";
import useAddNode from "@/hooks/useAddNode";

const AddWebScrapperNode = () => {
  const { addWebScrapperNode } = useAddNode();
  const isWPressed = useKeyPress("w" || "W");

  useEffect(() => {
    if (isWPressed) {
      addWebScrapperNode();
    }
  }, [isWPressed, addWebScrapperNode]);

  return (
    <PanelItem onClick={addWebScrapperNode} text="Website" shortcutKey="W">
      <Globe />
    </PanelItem>
  );
};

export default AddWebScrapperNode;
