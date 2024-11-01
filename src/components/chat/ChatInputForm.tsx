import { Button } from "@/components/ui/button";
import { usePanel } from "@/context/panel";
import { useUser } from "@clerk/nextjs";
import { ChatRequestOptions } from "ai";
import { ArrowRightIcon, Loader, LoaderIcon, Send } from "lucide-react";
import { nanoid } from "nanoid";
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Chat } from "../../../typing";
import { Textarea } from "../ui/textarea";
interface Props {
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  input: string;
  handleSubmit: (
    event: { preventDefault: () => void },
    chatRequestOptions: ChatRequestOptions
  ) => void;
  isLoading: boolean;
  nodeId: string;
  boardId: string;
  currentChat: Chat | null;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setIsAIThinking: React.Dispatch<React.SetStateAction<boolean>>;
  isAIThinking: boolean;
}

const ChatInputForm = ({
  handleInputChange,
  input,
  handleSubmit,
  isLoading,
  boardId,
  nodeId,
  currentChat,
  setChats,
  setCurrentChat,
  setIsAIThinking,
  isAIThinking,
}: Props) => {
  const { user } = useUser();
  const { nodes, edges } = usePanel();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scrollHeight
    }
  }, [input]);

  const getKnowledgeBaseNodes = useCallback(
    (chatNodeId: string) => {
      const knowledgeEdges = edges.filter((edge) => edge.target === chatNodeId);
      const knowledgeBaseNodeIds = knowledgeEdges.map((edge) => edge.source);
      return nodes.filter((node) => knowledgeBaseNodeIds.includes(node.id));
    },
    [edges, nodes]
  );

  const handleSendMessage = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input || input.trim().length === 0) return;
      setIsAIThinking(true);
      let newCurrentChat = currentChat as Chat;
      if (!currentChat?.title) {
        console.log("creating new chat");
        newCurrentChat = { id: nanoid(), title: input, createdAt: new Date() };
        setChats((prevChats) => [newCurrentChat, ...prevChats]);
        setCurrentChat(newCurrentChat);
      }
      handleSubmit(e, {
        options: {
          body: {
            knowledgeBase: getKnowledgeBaseNodes(nodeId),
            boardId,
            nodeId,
            currentChat: newCurrentChat,
          },
        },
      });
    },
    // Not putting currentchat in deps is intentional because it can trigger infinite loop because of the use of setCurrentChat
    [
      boardId,
      getKnowledgeBaseNodes,
      handleSubmit,
      input,
      nodeId,
      setChats,
      setCurrentChat,
      user?.id,
      setIsAIThinking,
    ]
  );

  return (
    <form
      onSubmit={handleSendMessage}
      className="flex items-end gap-1 border rounded-md pb-1 pr-1"
    >
      <Textarea
        ref={textareaRef}
        value={input}
        placeholder="Send a message..."
        onChange={(e) => {
          handleInputChange(e);
        }}
        disabled={isLoading}
        className="bg-transparent flex-1 h-4 border-none resize-none max-h-[250px] no-scrollbar focus-visible:ring-0 focus-within:ring-0 focus-within:outline-none"
      />
      <Button
        disabled={isLoading || input.trim().length === 0}
        size="icon"
        type="submit"
        className="custom-shadow"
      >
        {isLoading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
};

export default ChatInputForm;
