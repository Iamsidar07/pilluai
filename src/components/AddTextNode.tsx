"use client";
import React, { useEffect } from "react";
import PanelItem from "./panels/PanelItem";
import { useKeyPress } from "@xyflow/react";
import { Type } from "lucide-react";
import useAddNode from "@/hooks/useAddNode";

const AddTextNode = () => {
  const { addTextNode } = useAddNode();
  const isTPressed = useKeyPress("t" || "T");

  useEffect(() => {
    if (isTPressed) {
      addTextNode();
    }
  }, [isTPressed, addTextNode]);

  return (
    <PanelItem onClick={addTextNode} text="Image" shortcutKey="I">
      <Type />
    </PanelItem>
  );
};

export default AddTextNode;
