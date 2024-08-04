"use client";
import { cn } from "@/lib/utils";
import { NodeProps } from "@xyflow/react";
import Image from "next/image";
import { FaArrowRight, FaSpinner } from "react-icons/fa";
import { SlGlobe } from "react-icons/sl";
import CustomHandle from "../CustomHandle";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import useWebScrapperNode from "@/hooks/useWebScrapperNode";

const WebScrapperNode = ({ id, selected, data }: NodeProps) => {
  const { handleAddWebscrapperNode, isLoading, setUrl, url } =
    useWebScrapperNode(id);

  return (
    <div
      className={cn(
        "fixed-dimension shadow-lg overflow-hidden bg-[var(--novel-highlight-blue)] rounded p-2",
        {
          "bg-blue-300": selected,
          "!h-auto": !data.url,
        }
      )}
    >
      <CustomHandle type="source" />
      <div
        className={cn(
          "flex items-center gap-2 mb-2 truncate transition-all text-blue-500",
          {
            "text-white": selected,
          }
        )}
      >
        {isLoading ? (
          <FaSpinner className="w-6 h-6 animate-spin" />
        ) : (
          <SlGlobe className="w-6 h-6" />
        )}
        <h3 className="truncate">{data.title as string}</h3>
      </div>
      <div className="w-full h-full">
        {data.url ? (
          <AspectRatio ratio={16 / 9} className="h-full w-full rounded">
            <Image
              src={
                (data.screenshotUrl
                  ? data.screenshotUrl
                  : data.tempUrl) as string
              }
              width={200}
              height={200}
              alt="image"
              className="object-cover w-full h-auto max-w-full rounded"
            />
          </AspectRatio>
        ) : (
          <form
            onSubmit={handleAddWebscrapperNode}
            className="flex items-center gap-2 border rounded py-2 bg-white"
          >
            <input
              className="w-full h-full outline-none p-1"
              type="text"
              value={url}
              placeholder="Enter any website url"
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-2 rounded-full flex items-center justify-center bg-blue-400 text-white disabled:bg-opacity-80"
            >
              {isLoading ? (
                <FaSpinner className="w-2 h-2 animate-spin" />
              ) : (
                <FaArrowRight className="w-2 h-2" />
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default WebScrapperNode;
