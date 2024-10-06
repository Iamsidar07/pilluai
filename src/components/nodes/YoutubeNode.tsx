"use client";
import { cn } from "@/lib/utils";
import { NodeProps } from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import { FaYoutube } from "react-icons/fa";
import CustomHandle from "../CustomHandle";

const YoutubeNode = ({ data, selected }: NodeProps) => {
  const [videoId, setVideoId] = useState("");

  useEffect(() => {
    setVideoId(
      new URLSearchParams(String(data?.url).split("watch")[1]).get(
        "v",
      ) as string,
    );
  }, [data.url]);

  const youtubeNodeWithMemo = useMemo(
    () => (
      <div className="fixed-dimension overflow-hidden bg-red-100 rounded shadow ring-1 ring-red-100">
        <CustomHandle type="source" />
        <div
          className={cn(
            "flex flex-col gap-1 group p-1 transition-all w-full h-full overflow-hidden",
          )}
        >
          <div
            className={cn(
              "flex items-center rounded py-2 gap-2 px-2 truncate bg-[#FF0000] text-white transition-all w-fit max-w-full",
            )}
          >
            <div className="w-6 h-6 grid place-items-center">
              <FaYoutube className="w-5 h-5" />
            </div>
            <h3 className="truncate text-sm">{data.title as string}</h3>
          </div>
          <iframe
            className="w-full h-full rounded nodrag"
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </div>
    ),
    [data.title, videoId],
  );

  return youtubeNodeWithMemo;
};

export default YoutubeNode;
