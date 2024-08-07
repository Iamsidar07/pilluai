"use client";

import useUpload, { StatusText } from "@/hooks/useUpload";
import { cn } from "@/lib/utils";
import { CircleArrowDown, Rocket, RocketIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const FileUploader = ({ nodeId }: { nodeId: string }) => {
  const { progress, status, handleUpload } = useUpload(nodeId);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file) {
        // upload file to server
        await handleUpload(file);
      }
    },
    [handleUpload],
  );
  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      accept: {
        "application/pdf": [".pdf"],
      },
    });

  const uploadProgress = progress !== null && progress >= 0 && progress <= 100;
  const statusIcons: {
    [key in StatusText]: JSX.Element;
  } = {
    [StatusText.GENERATING]: <Rocket />,
    [StatusText.SAVING]: <Rocket />,
    [StatusText.UPLOADED]: <Rocket />,
    [StatusText.UPLOADING]: <Rocket />,
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4 !text-xs">
      {/* Loading */}
      {uploadProgress && status && (
        <div className="flex flex-col gap-1 items-center justify-center">
          {statusIcons[status]}
          <p className="text-xs text-center">{status}</p>
        </div>
      )}
      {!uploadProgress && (
        <div
          {...getRootProps()}
          className={cn(
            "p-8 border w-full h-full flex flex-col items-center justify-center rounded border-dashed border-gray-300 bg-gray-100/10 text-gray-400 shadow-sm",
            {
              "bg-blue-100 text-blue-600 border-blue-800":
                isFocused || isDragAccept,
            },
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            {isDragActive ? (
              <>
                <RocketIcon className="w-4 h-4 animate-ping" />
                <p className="text-xs">Drop here ...</p>
              </>
            ) : (
              <>
                <CircleArrowDown className="w-4 h-4 animate-bounce" />
                <p className="text-xs text-center">upload file</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
