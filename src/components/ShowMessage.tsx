"use client";
import { Message } from "ai";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import MarkdownRenderer from "./MarkdownRenderer";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "@clerk/nextjs";

const ShowMessage = ({ role, content }: Message) => {
  const { user } = useUser();
  return (
    <div className="textselectable pt-1">
      <div className="flex items-center gap-1">
        {role === "user" ? (
          <Avatar className="w-5 h-5">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="w-5 h-5">
            <AvatarImage src="/logo.png" />
            <AvatarFallback>P</AvatarFallback>
          </Avatar>
        )}
        {role === "user" ? (
          <span className="text-green-500 text-sm">
            {user?.fullName || user?.emailAddresses.toString().substring(0, 5)}
          </span>
        ) : (
          <span className="text-primary text-sm">Pillu AI</span>
        )}
      </div>
      <div className="w-full pr-10 relative">
        <MarkdownRenderer content={content} />
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
