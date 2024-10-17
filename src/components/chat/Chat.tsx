import { db } from "@/firebase";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { NodeProps } from "@xyflow/react";
import { useChat } from "ai/react";
import { addDoc, collection } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Chat } from "../../../typing";
import CustomHandle from "../CustomHandle";
import CustomNodeResizer from "../CustomNodeResizer";
import ChatInputForm from "./ChatInputForm";
import ChatSidebar from "./ChatSidebar";
import MessageList from "./MessageList";

const ChatNode = ({ id, selected }: NodeProps) => {
  const { user } = useUser();
  const params = useParams();
  const boardId = params.boardId as string;
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const {
    handleInputChange,
    input,
    setInput,
    handleSubmit,
    messages,
    setMessages,
    isLoading,
  } = useChat({
    onResponse() {
      setIsAIThinking(false);
    },
    onError(err) {
      console.log("error while chat:", err);
      toast.error("Something went wrong");
      setIsAIThinking(false);
    },
    async onFinish(message) {
      if (!user) return;
      await addDoc(
        collection(
          db,
          `users/${user.id}/boards/${boardId}/chatNodes/${id}/chats/${currentChat?.id}/messages`,
        ),
        message,
      );
      console.log("message added");
    },
  });

  return (
    <div
      className={cn(
        "bg-white shadow rounded-md overflow-hidden flex h-full w-full border",
        {
          "border border-orange-100": selected,
        },
      )}
    >
      <CustomHandle type="target" />
      <CustomNodeResizer />
      <ChatSidebar
        chats={chats}
        currentChat={currentChat}
        setChats={setChats}
        setCurrentChat={setCurrentChat}
        setInput={setInput}
        setMessages={setMessages}
        boardId={params.boardId as string}
        nodeId={id}
      />
      <div className="w-2/3 pl-2 pb-2 nodrag nowhell cursor-text flex flex-col">
        <MessageList
          currentChat={currentChat}
          messages={messages}
          setMessages={setMessages}
          boardId={params.boardId as string}
          nodeId={id}
          isAIThinking={isAIThinking}
        />
        <ChatInputForm
          handleInputChange={handleInputChange}
          input={input}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          nodeId={id}
          boardId={boardId}
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
          setChats={setChats}
          setIsAIThinking={setIsAIThinking}
          isAIThinking={isAIThinking}
        />
      </div>
    </div>
  );
};

export default ChatNode;
