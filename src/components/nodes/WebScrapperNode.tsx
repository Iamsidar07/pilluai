"use client";
import { usePanel } from "@/context/panel";
import { cn, isValidURL } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { NodeProps } from "@xyflow/react";
import axios from "axios";
import Image from "next/image";
import { useState } from "react";
import { FaArrowRight, FaSpinner } from "react-icons/fa";
import { SlGlobe } from "react-icons/sl";
import CustomHandle from "../CustomHandle";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { toast } from "sonner";

const WebScrapperNode = ({ id, selected, data }: NodeProps) => {
  const { updateNode } = usePanel();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: scrape } = useMutation({
    mutationFn: async (url: string) =>
      axios.post("/api/website/scrape", { url }),
  });

  const { mutateAsync: indexWebsite } = useMutation({
    mutationFn: async (url: string) =>
      axios.post("/api/website/index", { url }),
  });

  const { mutateAsync: uploadImage } = useMutation({
    mutationFn: async (buffer: Buffer) =>
      axios.post("/api/image/upload", { buffer }),
  });
  const { mutateAsync: analyseImage } = useMutation({
    mutationFn: (url: string) =>
      axios.post("/api/image/analyse", {
        url,
      }),
  });

  const handleAddWebscrapperNode = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!isValidURL(url)) {
      toast.error("Please enter a valid url");
      return;
    }
    try {
      setIsLoading(true);
      const { data } = await scrape(url);
      updateNode({
        id,
        type: "webScrapperNode",
        data: {
          url,
          title: data.title,
          description: data.description,
          tempUrl: `data:image/png;base64,${data.base64}`,
        },
      });

      const {
        data: { url: secure_url },
      } = await uploadImage(data.buffer);
      updateNode({
        id,
        type: "webScrapperNode",
        data: {
          screenshotUrl: secure_url as string,
          tempUrl: null,
        },
      });
      setIsLoading(false);
      // const { data: imageInfo } = await analyseImage(secure_url as string);
      // console.log("Web, text", imageInfo);
      //
      // updateNode({
      //   id,
      //   type: "webScrapperNode",
      //   data: { text: imageInfo.text },
      // });

      const {
        data: { namespace },
      } = await indexWebsite(url);
      updateNode({
        id,
        type: "webScrapperNode",
        data: {
          namespace,
        },
      });
    } catch (error: any) {
      console.log("error:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div
      className={cn(
        "fixed-dimension shadow-lg overflow-hidden bg-[var(--novel-highlight-blue)] rounded p-2",
        {
          "bg-blue-300": selected,
          "!h-auto": !data.url,
        },
      )}
    >
      <CustomHandle type="source" />
      <div
        className={cn(
          "flex items-center gap-2 mb-2 truncate transition-all text-blue-500",
          {
            "text-white": selected,
          },
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
