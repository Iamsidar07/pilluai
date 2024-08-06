"use client";
import { usePanel } from "@/context/panel";
import { cn } from "@/lib/utils";
import { NodeProps, NodeResizeControl, NodeResizer } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import CustomHandle from "../CustomHandle";

const TextNode = ({ id, selected, data }: NodeProps) => {
  const { updateNode } = usePanel();

  const [textContent, setTextContent] = useState((data?.text as string) || "");
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
      className={cn("w-full h-full bg-white rounded ring-1 ring-gray-900/15", {
        "ring ring-gray-200": selected,
      })}
    >
      <NodeResizeControl color="#FFA500" />
      <NodeResizer color="#FFA500" />
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
