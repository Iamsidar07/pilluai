"use client";
import { TTextNode, TChatNode, TWebScrapperNode } from "@/components/nodes";
import { usePanel } from "@/context/panel";
import { nanoid } from "nanoid";
import { useCallback } from "react";

const useAddNode = () => {
  const { addNode } = usePanel();

  const addTextNode = useCallback(() => {
    const newNode: TTextNode = {
      id: nanoid(),
      position: { x: 0, y: 0 },
      type: "textNode",
      width: 250,
      height: 100,
      data: {
        text: "",
        type: "textNode",
      },
    };
    addNode(newNode);
  }, [addNode]);

  const addChatNode = useCallback(() => {
    const newNode: TChatNode = {
      id: nanoid(),
      position: { x: 0, y: 0 },
      width: 700,
      height: 600,
      type: "chatNode",
      data: {
        type: "chatNode",
      },
    };
    addNode(newNode);
  }, [addNode]);

  const addWebScrapperNode = useCallback(() => {
    const newNode: TWebScrapperNode = {
      id: nanoid(),
      position: { x: 0, y: 0 },
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
  }, [addNode]);

  return { addTextNode, addWebScrapperNode, addChatNode };
};

export default useAddNode;
