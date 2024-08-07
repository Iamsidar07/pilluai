"use client";
import { cn } from "@/lib/utils";
import { NodeProps } from "@xyflow/react";
import Image from "next/image";
import CustomHandle from "../CustomHandle";
import { AspectRatio } from "../ui/aspect-ratio";

const ImageNode = ({ id, data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        "p-1 pb-0 ring-1 ring-gray-900/10 overflow-hidden fixed-dimension bg-[var(--novel-highlight-gray)] rounded"
      )}
    >
      <CustomHandle type="source" />
      <div className="text-nowrap text-sm h-fit truncate p-1 mb-1">
        {data.title as string}
      </div>
      <AspectRatio ratio={16 / 9} className="h-full w-full rounded">
        <Image
          src={(data.url ? data.url : data.tempUrl) as string}
          width={200}
          height={200}
          alt="image"
          className="object-cover w-full h-full max-w-full rounded"
        />
      </AspectRatio>
    </div>
  );
};

export default ImageNode;
