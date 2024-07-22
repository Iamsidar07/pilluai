"use client";
import React, { useEffect, useRef } from "react";
import { useKeyPress } from "@xyflow/react";
import useAddNode from "./useAddNode";

interface Props {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectImageRef: React.MutableRefObject<HTMLLabelElement | null>;
}

const useCommandKey = ({ setOpen, selectImageRef }: Props) => {
  const { addChatNode, addTextNode, addWebScrapperNode } = useAddNode();
  const iPressed = useKeyPress("i");
  const yPressed = useKeyPress("y");
  const wPressed = useKeyPress("w");
  const cPressed = useKeyPress("c");
  const tPressed = useKeyPress("t");

  useEffect(() => {
    if (yPressed) {
      setOpen(true);
    }
    if (iPressed && selectImageRef.current) {
      selectImageRef.current.click();
    }
    if (cPressed) {
      addChatNode();
    }
    if (tPressed) {
      addTextNode();
    }
    if (wPressed) {
      addWebScrapperNode();
    }
  }, [iPressed, yPressed, cPressed, tPressed, wPressed, addChatNode, addTextNode, addWebScrapperNode, selectImageRef, setOpen]);
  return {};
};

export default useCommandKey;
