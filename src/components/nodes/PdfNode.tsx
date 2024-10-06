"use client";

import { cn } from "@/lib/utils";
import { NodeProps } from "@xyflow/react";
import { useMemo } from "react";
import CustomHandle from "../CustomHandle";
import CustomNodeResizer from "../CustomNodeResizer";
import PdfViewer from "../PdfViewer";

const PdfNode = ({ data, selected }: NodeProps) => {
  const pdfNodeWithMemo = useMemo(
    () => (
      <div
        className={cn(
          "ring-1 ring-gray-900/10 w-full h-fit bg-white rounded-md shadow p-4",
          {
            "h-full": data?.url,
            "border border-green-200": selected,
          },
        )}
      >
        <CustomHandle type="source" />
        <CustomNodeResizer />
        <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden gap-4 !text-xs">
          {data.url ? (
            <div className={cn("truncate w-full h-full overflow-hidden")}>
              <PdfViewer name={data.name as string} url={data.url as string} />
            </div>
          ) : null}
        </div>
      </div>
    ),
    [data.name, data.url, selected],
  );
  return pdfNodeWithMemo;
};

export default PdfNode;
