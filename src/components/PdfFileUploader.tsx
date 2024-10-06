"use client";

import useUpload, { StatusText } from "@/hooks/useUpload";
import { cn, getNewNodePosition } from "@/lib/utils";
import { CircleArrowDown, Rocket, RocketIcon } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { TPdfNode } from "./nodes";
import { nanoid } from "nanoid";
import { usePanel } from "@/context/panel";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";

const FileUploader = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { addNode, nodes } = usePanel();
  const { fitView } = useReactFlow();
  const { progress, status, handleUpload } = useUpload();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const newNode: TPdfNode = {
        position: getNewNodePosition(nodes),
        id: nanoid(),
        initialWidth: 225,
        initialHeight: 175,
        data: {
          type: "pdfNode",
          url: "",
          name: file.name,
          namespace: "",
          metadata: "",
        },
        type: "pdfNode",
      };
      addNode(newNode);
      fitView();
      try {
        await handleUpload(file, newNode.id);
        setOpen(false);
      } catch (error) {
        console.log(error);
        toast.error("Failed to upload file");
      }
    },
    [addNode, fitView, handleUpload, nodes, setOpen],
  );
  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      maxSize: 10 ** 6 * 5, // 5MB
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
    <div className="w-full h-[150px] flex flex-col items-center justify-center gap-4 !text-xs">
      {/*todo: Add feature for pdf url*/}
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
              "bg-pink-100 text-pink-600 border-pink-800":
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
