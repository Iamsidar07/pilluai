"use client";

import { NodeProps } from "@xyflow/react";
import { useState } from "react";
import CustomHandle from "../CustomHandle";
import CustomResizer from "../CustomResizer";
import { FaRegFilePdf } from "react-icons/fa";
import useUpload from "@/hooks/useUpload";
import FileUploader from "../PdfFileUploader";
import PdfViewer from "../PdfViewer";
import { cn } from "@/lib/utils";

const PdfNode = ({ id, selected, data }: NodeProps) => {
  return (
    <div
      className={cn(
        "ring-1 ring-gray-900/10 w-full h-full bg-white shadow-sm rounded",
        {
          "ring-primary": selected,
        },
      )}
    >
      <CustomHandle type="source" />
      <CustomResizer />
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 !text-xs">
        {data?.url && data?.name ? (
          <div className="truncate w-full h-full">
            <PdfViewer name={data.name as string} url={data.url as string} />
            {/* pdf preview */}
          </div>
        ) : (
          <div className="p-2">
            <FileUploader nodeId={id} />
            {/* file uploader */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfNode;
