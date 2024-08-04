"use client";
import { Message } from "ai";
import Image from "next/image";
import MarkdownRenderer from "./MarkdownRenderer";
import { Copy } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import useCurrentUser from "@/context/currentUser";

const ShowMessage = ({ role, content }: Message) => {
  const { user } = useCurrentUser();

  const MemoizedMarkdownRenderer = useMemo(() => {
    return <MarkdownRenderer content={content} />;
  }, [content]);
  return (
    <div className="nowheel nodrag textselectable">
      <div className="flex items-center gap-1">
        <Image
          src={
            role === "user"
              ? user?.photoURL ||
                "https://poppyai.vercel.app/_next/image?url=https%3A%2F%2Flh3.googleusercontent.com%2Fa%2FACg8ocIg2tIuvQwsNOmw61a3xQmNePZEtxUE5qfcs68Kj9TJzSAJukGl%3Ds96-c&w=32&q=75"
              : "https://poppyai.vercel.app/_next/image?url=%2Flogo-300-no-text.png&w=48&q=75"
          }
          alt="Profile"
          width={20}
          height={20}
          className="rounded-full overflow-hidden"
        />
        {role === "user" ? (
          <span className="text-green-500 text-sm">{user?.name || ""}</span>
        ) : (
          <span className="text-primary text-sm">Pillu AI</span>
        )}
      </div>
      <div className="w-full pr-10 relative">
        {MemoizedMarkdownRenderer}
        <Copy
          className="absolute top-2 right-2 w-3 h-3 cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(content);
            toast.success("Successfully copied to clipboard");
          }}
        />
      </div>
    </div>
  );
};
export default ShowMessage;
