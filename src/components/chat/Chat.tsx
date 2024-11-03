import { db } from "@/firebase";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { NodeProps } from "@xyflow/react";
import { useChat } from "ai/react";
import { addDoc, collection } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Chat } from "../../../typing";
import CustomHandle from "../CustomHandle";
import CustomNodeResizer from "../CustomNodeResizer";
import ChatInputForm from "./ChatInputForm";
import ChatSidebar from "./ChatSidebar";
import MessageList from "./MessageList";
import SelectModel from "./SelectModel";

export interface Model {
  id: "google-generative-ai" | "mistral";
  name: "Mistral AI" | "Google Generative AI";
}

const ChatNode = ({ id, selected }: NodeProps) => {
  const { user } = useUser();
  const params = useParams();
  const currentChatRef = useRef<Chat | null>(null);
  const boardId = params.boardId as string;
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [hasFetchedMessages, setHasFetchedMessages] = useState(false);
  const [model, setModel] = useState<Model>({
    id: "mistral",
    name: "Mistral AI",
  });
  const {
    handleInputChange,
    input,
    setInput,
    handleSubmit,
    messages,
    setMessages,
    isLoading,
  } = useChat({
    async onResponse(res) {
      setIsAIThinking(false);
      console.log("currentChat", currentChatRef.current);
    },
    onError(err) {
      console.log("error while chat:", err);
      toast.error("Something went wrong");
      setIsAIThinking(false);
    },
    async onFinish(message) {
      if (!user) return;
      console.log("message:", message, currentChatRef.current);
      await addDoc(
        collection(
          db,
          `users/${user.id}/boards/${boardId}/chatNodes/${id}/chats/${currentChatRef.current?.id}/messages`
        ),
        message
      );
    },
  });

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  return (
    <div
      className={cn(
        "bg-white shadow rounded-md overflow-hidden flex h-full w-full border",
        {
          "border border-orange-100": selected,
        }
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
        setHasFetchedMessages={setHasFetchedMessages}
      />
      <div className="w-2/3 px-2 pb-2 nodrag nowhell cursor-text flex flex-col">
        <MessageList
          currentChat={currentChat}
          messages={messages}
          setMessages={setMessages}
          boardId={params.boardId as string}
          nodeId={id}
          isAIThinking={isAIThinking}
          hasFetchedMessages={hasFetchedMessages}
          setHasFetchedMessages={setHasFetchedMessages}
        />
        <SelectModel model={model} setModel={setModel} />
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
          model={model}
        />
      </div>
    </div>
  );
};

export default ChatNode;
