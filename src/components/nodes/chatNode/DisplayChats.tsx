import { cn } from "@/lib/utils";
import React from "react";
import { IoCreateOutline } from "react-icons/io5";
import { Message } from "ai/react";
import { Chat } from "../../../../typing";

interface DisplayChatsProps {
  handleNewChat: (title?: string) => Promise<undefined | Chat>;
  getCurrentChatMessages: (chatId: string, messagesId: string) => void;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  currentChat: Chat | null;
  chats: Chat[];
  setMessages: (messages: Message[]) => void;
}

const DisplayChats = ({
  handleNewChat,
  getCurrentChatMessages,
  setCurrentChat,
  currentChat,
  chats,
  setMessages,
}: DisplayChatsProps) => {
  return (
    <div className="w-1/3 border-r relative">
      <div className="p-2 bg-zinc-50 h-full ">
        <div className=" flex items-center justify-end sticky">
          <button
            onClick={() => handleNewChat("")}
            className="bg-blue-500 text-white px-2 py-1 text-sm rounded cursor-pointer flex items-center gap-1"
          >
            <IoCreateOutline className="w-4 h-4" />
          </button>
        </div>
        <h3 className="mt-4 mb-2 text-zinc-400">Previous Chats</h3>
        <div className="flex flex-col gap-px">
          {chats?.map((chat) => (
            <p
              key={chat.id}
              className={cn(
                "truncate text-sm cursor-pointer text-zinc-600 hover:text-zinc-900 transition-all",
                {
                  "font-bold": currentChat?.id === chat.id,
                }
              )}
              onClick={() => {
                setCurrentChat(chat);
                getCurrentChatMessages(chat.id, chat.messagesId);
              }}
            >
              {chat?.title || ""}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisplayChats;
