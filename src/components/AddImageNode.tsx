"use client";
import React, { useEffect, useRef } from "react";
import PanelItem from "./panels/PanelItem";
import { ImageIcon } from "lucide-react";
import useAddImageNode from "./panels/AddImageNode";
import { useKeyPress } from "@xyflow/react";

const AddImageNode = () => {
  const { handleSelectFile } = useAddImageNode();
  const isIPressed = useKeyPress("i" || "I");
  const selectImageRef = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    if (isIPressed && selectImageRef.current) {
      selectImageRef.current.click();
    }
  }, [isIPressed]);

  return (
    <PanelItem text="Image" shortcutKey="I">
      <label ref={selectImageRef} htmlFor="selectImage">
        <ImageIcon />
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleSelectFile}
        className="hidden"
        id="selectImage"
      />
    </PanelItem>
  );
};

export default AddImageNode;
