"use client";
import useCurrentUser from "@/context/currentUser";
import { Message } from "ai";
import { Copy } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import MarkdownRenderer from "./MarkdownRenderer";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const ShowMessage = ({ role, content }: Message) => {
  const { user } = useCurrentUser();

  const MemoizedMarkdownRenderer = useMemo(() => {
    return <MarkdownRenderer content={content} />;
  }, [content]);
  return (
    <div className="nowheel nodrag textselectable">
      <div className="flex items-center gap-1">
        {role === "user" ? (
          <Avatar>
            <AvatarImage src={user?.photoURL} className="w-5 h-5" />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar>
            <AvatarImage src="/logo.png" className="w-5 h-5" />
            <AvatarFallback>Pillu AI</AvatarFallback>
          </Avatar>
        )}
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
