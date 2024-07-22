"use client";
import { usePanel } from "@/context/panel";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { TChatNode, TTextNode, TWebScrapperNode } from "../nodes";

const useAddNode = () => {
  const { addNode } = usePanel();

  const addTextNode = useCallback(() => {
    const newNode: TTextNode = {
      id: nanoid(),
      position: { x: 0, y: 0 },
      type: "textNode",
      width: 515,
      height: 356,
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
        text: "",
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
        text: "",
        url: "",
        screenshotUrl: "",
        userName: "",
        userEmail: "",
        description: "",
        namespace: "",
      },
    };
    addNode(newNode);
  }, [addNode]);

  return { addTextNode, addWebScrapperNode, addChatNode };
};

export default useAddNode;
