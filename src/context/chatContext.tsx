import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { NodeProps } from "@xyflow/react";
import { useChat } from "ai/react";
import { addDoc, collection } from "firebase/firestore";
import { useParams } from "next/navigation";
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { toast } from "sonner";
import { Chat, ChatStore, Model } from "../../typing";

interface Props {
  children: React.ReactNode;
  nodeProps: NodeProps;
}

const defaultValues: ChatStore = {
  nodeId: "",
  chats: [],
  setChats: () => {},
  setMessages: () => {},
  currentChat: null,
  setCurrentChat: () => {},
  boardId: "",
  setHasFetchedMessages: () => {},
  setInput: () => {},
  isAIThinking: false,
  hasFetchedMessages: false,
  messages: [],
  model: {
    id: "mistral",
    name: "Mistral AI",
  },
  setModel: () => {},
  handleInputChange: () => {},
  input: "",
  isLoading: false,
  handleSubmit: () => {},
  setIsAIThinking: () => {},
};

const ChatContext = createContext<ChatStore>(defaultValues);

const ChatContextProvider = ({ children, nodeProps }: Props) => {
  const { id } = nodeProps;
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
          `users/${user.id}/boards/${boardId}/chatNodes/${nodeProps.id}/chats/${currentChatRef.current?.id}/messages`
        ),
        message
      );
    },
  });
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  return (
    <ChatContext.Provider
      value={{
        boardId,
        nodeId: nodeProps.id,
        chats,
        setChats,
        setInput,
        setMessages,
        currentChat,
        setCurrentChat,
        setHasFetchedMessages,
        isAIThinking,
        hasFetchedMessages,
        messages,
        setModel,
        model,
        handleInputChange,
        handleSubmit,
        input,
        isLoading,
        setIsAIThinking,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);

export default ChatContextProvider;
