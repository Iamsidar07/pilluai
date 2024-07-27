"use client";
import { usePanel } from "@/context/panel";
import { cn } from "@/lib/utils";
import { NodeProps } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import CustomHandle from "../CustomHandle";
import CustomResizer from "../CustomResizer";

const TextNode = ({ id, selected }: NodeProps) => {
  const { updateNode } = usePanel();

  const [textContent, setTextContent] = useState("");
  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
  }, []);

  useEffect(() => {
    updateNode({
      id,
      type: "textNode",
      data: {
        text: textContent,
      },
    });
  }, [textContent, id, updateNode]);

  return (
    <div
      className={cn("w-full h-full bg-white rounded shadow-lg", {
        "ring ring-gray-200": selected,
      })}
    >
      <CustomResizer />
      <CustomHandle type="source" />
      <div className="h-full border rounded">
        <textarea
          value={textContent}
          onChange={onChange}
          placeholder="Double click to start typing..."
          className="resize-none outline-none p-2 w-full h-full bg-transparent text-sm"
        />
      </div>
    </div>
  );
};

export default TextNode;
