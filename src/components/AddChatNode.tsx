"use client";
import React, { useEffect } from "react";
import PanelItem from "./panels/PanelItem";
import { useKeyPress } from "@xyflow/react";
import { Bot } from "lucide-react";
import useAddNode from "@/hooks/useAddNode";

const AddChatNode = () => {
  const { addChatNode } = useAddNode();
  const isCPressed = useKeyPress("c" || "C");

  useEffect(() => {
    if (isCPressed) {
      addChatNode();
    }
  }, [isCPressed, addChatNode]);

  return (
    <PanelItem onClick={addChatNode} text="Chat" shortcutKey="C">
      <Bot />
    </PanelItem>
  );
};

export default AddChatNode;
