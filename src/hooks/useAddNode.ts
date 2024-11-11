"use client";
import { TTextNode, TChatNode, TWebScrapperNode } from "@/components/nodes";
import { usePanel } from "@/context/panel";
import { getNewNodePosition } from "@/lib/utils";
import { nanoid } from "nanoid";
import { useCallback, useMemo } from "react";

interface BaseNodeConfig {
  id: string;
  position: { x: number; y: number };
  type: "textNode" | "chatNode" | "webScrapperNode";
}

const useAddNode = () => {
  const { addNode, nodes } = usePanel();
  const newNodePosition = useMemo(() => getNewNodePosition(nodes), [nodes]);

  const createBaseNode = useCallback(
    (type: "textNode" | "chatNode" | "webScrapperNode"): BaseNodeConfig => ({
      id: nanoid(),
      position: newNodePosition,
      type,
    }),
    [newNodePosition]
  );

  const addTextNode = useCallback(() => {
    const newNode: TTextNode = {
      ...createBaseNode("textNode"),
      width: 240,
      height: 50,
      data: {
        text: "",
        type: "textNode" as const,
        metadata:
          "You are a prompt or information source. If you are a prompt, use all the knowledge bases you have access to.",
      },
      type: "textNode" as const,
    };
    addNode(newNode);
  }, [addNode, createBaseNode]);

  const addChatNode = useCallback(() => {
    const newNode: TChatNode = {
      ...createBaseNode("chatNode"),
      width: 400,
      height: 350,
      data: {
        type: "chatNode" as const,
      },
      type: "chatNode" as const,
    };
    addNode(newNode);
  }, [addNode, createBaseNode]);

  const addWebScrapperNode = useCallback(() => {
    const newNode: TWebScrapperNode = {
      ...createBaseNode("webScrapperNode"),
      data: {
        title: "Website",
        type: "webScrapperNode" as const,
        url: "",
        screenshotUrl: "",
        text: "",
        metadata: "",
        namespace: "",
      },
      type: "webScrapperNode" as const,
    };
    addNode(newNode);
  }, [addNode, createBaseNode]);

  return { addTextNode, addWebScrapperNode, addChatNode };
};

export default useAddNode;
