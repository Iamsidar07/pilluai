"use client";
import { cn } from "@/lib/utils";
import { NodeProps } from "@xyflow/react";
import Image from "next/image";
import CustomHandle from "../CustomHandle";
import CustomResizer from "../CustomResizer";
import { AspectRatio } from "../ui/aspect-ratio";

const ImageNode = ({ id, data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        "w-full p-1 pb-0 shadow-lg overflow-hidden max-w-lg h-fit max-h-[32rem]",
        {
          "ring-2 ring-gray-200": selected,
        },
      )}
    >
      <CustomResizer />
      <CustomHandle type="source" />
      <div className="text-nowrap h-fit truncate bg-white p-1 shadow-xl mb-1">
        {data.title as string}
      </div>
      <AspectRatio ratio={16 / 9}>
        <Image
          src={(data.url ? data.url : data.tempUrl) as string}
          width={200}
          height={200}
          alt="image"
          className="object-cover w-full h-full max-w-full"
        />
      </AspectRatio>
    </div>
  );
};

export default ImageNode;
