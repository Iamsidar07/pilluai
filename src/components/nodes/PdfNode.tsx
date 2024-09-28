"use client";

import { cn } from "@/lib/utils";
import { NodeProps } from "@xyflow/react";
import CustomHandle from "../CustomHandle";
import FileUploader from "../PdfFileUploader";
import PdfViewer from "../PdfViewer";
import { useMemo } from "react";
import CustomNodeResizer from "../CustomNodeResizer";

const PdfNode = ({ id, data, selected }: NodeProps) => {
  const pdfNodeWithMemo = useMemo(
    () => (
      <div
        className={cn(
          "ring-1 ring-gray-900/10 w-full h-fit bg-white rounded-md shadow p-4",
          {
            "h-full": data?.url && data?.name,
            "border border-green-200": selected,
          },
        )}
      >
        <CustomHandle type="source" />
        <CustomNodeResizer />
        <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden gap-4 !text-xs">
          {data?.url && data?.name && data?.namespace ? (
            <div className={cn("truncate w-full h-full overflow-hidden")}>
              <PdfViewer name={data.name as string} url={data.url as string} />
            </div>
          ) : (
            <div className="p-2">
              <FileUploader nodeId={id} />
            </div>
          )}
        </div>
      </div>
    ),
    [data.name, data?.namespace, data.url, id, selected],
  );
  return pdfNodeWithMemo;
};

export default PdfNode;
