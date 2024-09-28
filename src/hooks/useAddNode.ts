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
      },
    };
    addNode(newNode);
    fitView();
  }, [addNode, fitView]);

  const addChatNode = useCallback(() => {
    const newNode: TChatNode = {
      id: nanoid(),
      position: getNewNodePosition(nodes),
      width: 400,
      height: 350,
      type: "chatNode",
      data: {
        type: "chatNode",
      },
    };
    addNode(newNode);
    fitView();
  }, [addNode, fitView]);

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
        namespace: "",
        base64: "",
      },
    };
    addNode(newNode);
    fitView();
  }, [addNode, fitView]);

  return { addTextNode, addWebScrapperNode, addChatNode };
};

export default useAddNode;
