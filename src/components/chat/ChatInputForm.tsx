import { Button } from "@/components/ui/button";
import { usePanel } from "@/context/panel";
import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { ChatRequestOptions } from "ai";
import { doc, setDoc } from "firebase/firestore";
import { ArrowRightIcon, LoaderIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { ChangeEvent, FormEvent, useCallback } from "react";
import { Chat } from "../../../typing";

interface Props {
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  input: string;
  handleSubmit: (
    event: { preventDefault: () => void },
    chatRequestOptions: ChatRequestOptions,
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

  const getKnowledgeBaseNodes = useCallback(
    (chatNodeId: string) => {
      const knowledgeEdges = edges.filter((edge) => edge.target === chatNodeId);
      const knowledgeBaseNodeIds = knowledgeEdges.map((edge) => edge.source);
      const knowledgeBaseNodes = nodes.filter((node) =>
        knowledgeBaseNodeIds.includes(node.id),
      );
      return knowledgeBaseNodes;
    },
    [edges, nodes],
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
        const chatCollectionRef = doc(
          db,
          `users/${user?.id}/boards/${boardId}/chatNodes/${nodeId}/chats`,
          newCurrentChat.id,
        );
        await setDoc(chatCollectionRef, {
          title: input,
          createdAt: new Date(),
        });
        console.log("updated chat title");
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
    ],
  );

  return (
    <div className="pr-1 shadow-sm rounded">
      <form
        onSubmit={handleSendMessage}
        className="flex items-end pr-1 rounded focus-within:shadow-smrelative border"
      >
        <textarea
          rows={1}
          className="flex-[0.85] p-2 text-sm outline-none bg-transparent border-none transition-transformpr-4"
          placeholder="Type your message here..."
          value={input}
          onChange={handleInputChange}
        />
        <Button
          disabled={isLoading || input.trim().length === 0}
          type="submit"
          size={"icon"}
          className="rounded-full h-5 w-5 absolute bottom-3 right-2 nowheel"
        >
          {isAIThinking ? (
            <LoaderIcon className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRightIcon className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatInputForm;
