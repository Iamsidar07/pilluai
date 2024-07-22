"use client";
import ShowMessage from "@/components/ShowMessage";
import React, { forwardRef } from "react";
import { Message } from "ai/react";

interface ChatMessagesListProps {
  messages: Message[];
}

const ChatMessagesList = forwardRef<HTMLDivElement, ChatMessagesListProps>(
  ({ messages }, messagesEndRef) => {
    return (
      <div className="flex flex-col flex-1 space-y-1 overflow-auto h-full pb-24 nodrag nowheel cursor-text">
        {messages?.map((message) => (
          <ShowMessage key={message.id} {...message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  },
);

ChatMessagesList.displayName = "ChatMessagesList";
export default ChatMessagesList;
