"use client";
import { TTextNode, TChatNode, TWebScrapperNode } from "@/components/nodes";
import { usePanel } from "@/context/panel";
import { getNewNodePosition } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { nanoid } from "nanoid";
import { useCallback, useMemo } from "react";

const useAddNode = () => {
  const { addNode, nodes } = usePanel();
  const { fitView } = useReactFlow();
  const newNodePosition = useMemo(() => getNewNodePosition(nodes), [nodes]);

  const addTextNode = useCallback(() => {
    const newNode: TTextNode = {
      id: nanoid(),
      position: newNodePosition,
      type: "textNode",
      width: 240,
      height: 50,
      data: {
        text: "",
        type: "textNode",
        metadata:
          "You are a prompt or information source. If you are a prompt, use all the knowledge bases you have access to.",
      },
    };
    addNode(newNode);
    fitView();
  }, [addNode, fitView, newNodePosition]);

  const addChatNode = useCallback(() => {
    const newNode: TChatNode = {
      id: nanoid(),
      position: newNodePosition,
      width: 400,
      height: 350,
      type: "chatNode",
      data: {
        type: "chatNode",
      },
    };
    addNode(newNode);
    fitView();
  }, [addNode, fitView, newNodePosition]);

  const addWebScrapperNode = useCallback(() => {
    const newNode: TWebScrapperNode = {
      id: nanoid(),
      position: newNodePosition,
      type: "webScrapperNode",
      data: {
        title: "Website",
        type: "webScrapperNode",
        url: "",
        screenshotUrl: "",
        text: "",
        // TODO: Add metadata
        metadata: "",
        namespace: "",
      },
    };
    addNode(newNode);
    fitView();
  }, [addNode, fitView, newNodePosition]);

  return { addTextNode, addWebScrapperNode, addChatNode };
};

export default useAddNode;
