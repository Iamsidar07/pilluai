"use client";
import CustomHandle from "@/components/CustomHandle";
import CustomResizer from "@/components/CustomResizer";
import { NodeProps } from "@xyflow/react";
import ChatForm from "./ChatForm";
import ChatMessagesList from "./ChatMessagesList";
import DisplayChats from "./DisplayChats";
import useChat from "@/hooks/useChat";

const ChatNode = ({ id: nodeId, selected }: NodeProps) => {
  const {
    input,
    handleSendMessage,
    handleInputChange,
    setUserMessageContent,
    messages,
    handleNewChat,
    getCurrentChatMessages,
    setCurrentChat,
    currentChat,
    chats,
    setMessages,
    messagesEndRef,
  } = useChat({
    nodeId,
  });

  return (
    <div className="bg-white shadow-lg rounded border overflow-hidden flex h-full w-full">
      <CustomResizer color={selected ? "violet" : "transparent"} />
      <CustomHandle type="target" />
      <DisplayChats
        handleNewChat={handleNewChat}
        getCurrentChatMessages={getCurrentChatMessages}
        setCurrentChat={setCurrentChat}
        currentChat={currentChat}
        chats={chats}
        setMessages={setMessages}
      />
      <div className="w-2/3 p-2 nodrag nowheel cursor-text flex flex-col">
        <ChatMessagesList ref={messagesEndRef} messages={messages} />
        <ChatForm
          handleSendMessage={handleSendMessage}
          setUserMessageContent={setUserMessageContent}
          handleInputChange={handleInputChange}
          input={input}
        />
      </div>
    </div>
  );
};

export default ChatNode;
