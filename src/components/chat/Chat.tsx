import { cn } from "@/lib/utils";
import { NodeProps } from "@xyflow/react";
import CustomHandle from "../CustomHandle";
import CustomNodeResizer from "../CustomNodeResizer";
import ChatInputForm from "./ChatInputForm";
import ChatSidebar from "./ChatSidebar";
import MessageList from "./MessageList";
import SelectModel from "./SelectModel";
import ChatContextProvider from "@/context/chatContext";

const ChatNode = (props: NodeProps) => {
  return (
    <ChatContextProvider nodeProps={props}>
      <div
        className={cn(
          "bg-white shadow rounded-md overflow-hidden flex h-full w-full border",
          {
            "border border-orange-100": props.selected,
          }
        )}
      >
        <CustomHandle type="target" />
        <CustomNodeResizer />
        <ChatSidebar />
        <div className="w-2/3 px-2 pb-2 nodrag nowhell cursor-text flex flex-col">
          <MessageList />
          <SelectModel />
          <ChatInputForm />
        </div>
      </div>
    </ChatContextProvider>
  );
};

export default ChatNode;
