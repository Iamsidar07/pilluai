"use client";

import { cn } from "@/lib/utils";
import { NodeProps, NodeResizeControl, NodeResizer } from "@xyflow/react";
import CustomHandle from "../CustomHandle";
import FileUploader from "../PdfFileUploader";
import PdfViewer from "../PdfViewer";

const PdfNode = ({ id, selected, data }: NodeProps) => {
  return (
    <div
      className={cn(
        "ring-1 ring-gray-900/10 w-full h-full bg-white rounded p-4"
      )}
    >
      <CustomHandle type="source" />
      <NodeResizeControl color="#008A00" />
      <NodeResizer color="#008A00" />
      <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden gap-4 !text-xs">
        {data?.url && data?.name ? (
          <div className="truncate w-full h-full overflow-hidden">
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
