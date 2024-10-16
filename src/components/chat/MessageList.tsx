import ShowMessage from "@/components/ShowMessage";
import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { Message } from "ai";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Chat } from "../../../typing";
import Loader from "../Loader";

interface Props {
  boardId: string;
  nodeId: string;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  currentChat: Chat | null;
  isAIThinking: boolean;
}
const MessageList = ({
  boardId,
  nodeId,
  messages,
  setMessages,
  currentChat,
  isAIThinking,
}: Props) => {
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const messagesMemoized = useMemo(
    () =>
      messages?.map((message) => <ShowMessage key={message.id} {...message} />),
    [messages],
  );

  const getMessages = useCallback(async () => {
    try {
      setMessagesLoading(true);
      const messagesSnapshot = await getDocs(
        query(
          collection(
            db,
            `users/${user?.id}/boards/${boardId}/chatNodes/${nodeId}/chats/${currentChat?.id}/messages`,
          ),
          orderBy("createdAt", "asc"),
        ),
      );
      const newMessages = messagesSnapshot.docs?.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          }) as Message,
      );
      setMessages(newMessages);
      console.log("new messages", newMessages);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setMessagesLoading(false);
    }
  }, [boardId, currentChat?.id, nodeId, setMessages, user?.id]);

  useEffect(() => {
    console.log("trying to get messages");
    if (!user || !currentChat?.id) return;
    getMessages();
  }, [boardId, nodeId, setMessages, user, currentChat?.id, getMessages]);

  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 space-y-1 overflow-auto h-full pb-24 nodrag nowheel cursor-text">
      {messagesLoading && !isAIThinking ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Loader />
          <p className="mt-4 opacity-60 text-center text-xs">
            Please wait a moment... ⏳
          </p>
        </div>
      ) : (
        messagesMemoized
      )}

      {/* {isAIThinking && (
        <ShowMessage
          role="assistant"
          content="AI is thinking..."
          id="thinking"
          createdAt={new Date()}
        />
      )} */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
