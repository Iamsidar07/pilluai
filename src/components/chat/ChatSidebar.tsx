import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import useSubscription from "@/hooks/useSubscription";
import { maxChatInOneChatNode } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Message } from "ai";
import { collection, doc, orderBy, query, setDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { IoCreateOutline } from "react-icons/io5";
import { toast } from "sonner";
import { Chat } from "../../../typing";

interface Props {
  boardId: string;
  nodeId: string;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setMessages: (messages: Message[]) => void;
  currentChat: Chat | null;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}
const ChatSidebar = ({
  boardId,
  nodeId,
  chats,
  setChats,
  setInput,
  setMessages,
  currentChat,
  setCurrentChat,
}: Props) => {
  const { user } = useUser();
  const hasActiveMembership = useSubscription();
  const [chatsSnapshot, loading, error] = useCollection(
    user &&
      query(
        collection(
          db,
          `users/${user?.id}/boards/${boardId}/chatNodes/${nodeId}/chats`
        ),
        orderBy("createdAt", "desc")
      ),
    {
      snapshotListenOptions: {
        includeMetadataChanges: true,
      },
    }
  );

  useEffect(() => {
    if (chatsSnapshot) {
      const newChats = chatsSnapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as Chat)
      );
      setChats(newChats);
      if (newChats.length > 0) {
        setCurrentChat(newChats[0]);
      }
    }
  }, [chatsSnapshot, setChats, setCurrentChat]);

  const handleCreateNewChat = useCallback(async () => {
    if (!hasActiveMembership && chats.length >= maxChatInOneChatNode) {
      toast.info("You've reached the limit of new chats.");
      return;
    }
    if (!user || !boardId || !nodeId) return;

    const newChatId = nanoid();
    await setDoc(
      doc(
        db,
        `users/${user.id}/boards/${boardId}/chatNodes/${nodeId}/chats`,
        newChatId
      ),
      {
        title: null,
        createdAt: new Date(),
      }
    );

    setCurrentChat({
      id: newChatId,
      title: null,
      createdAt: new Date(),
    } as Chat);
    setChats((prevChats) => [
      { id: newChatId, title: null, createdAt: new Date() },
      ...prevChats,
    ]);
    setInput("");
    setMessages([]);
  }, [
    user,
    boardId,
    nodeId,
    hasActiveMembership,
    setInput,
    setMessages,
    setChats,
    setCurrentChat,
  ]);

  return (
    <div className="w-1/3 border-r relative">
      <div className="p-2 h-full">
        <div className="flex items-center justify-end sticky">
          <Button
            size={"sm"}
            onClick={handleCreateNewChat}
            className="rounded-mmd cursor-pointer"
          >
            <IoCreateOutline className="w-5 h-5" />
          </Button>
        </div>
        <h3 className="mt-4 mb-2 text-zinc-400 whitespace-nowrap">
          Previous Chats
        </h3>
        <div className="flex flex-col">
          {loading && <Loader2 className="w-5 h-5 mt-4 mx-auto animate-spin" />}
          {chats?.length > 0 &&
            !loading &&
            chats.map(
              (chat) =>
                chat.title && (
                  <p
                    key={chat.id}
                    className={cn(
                      "capitalize truncate text-xs cursor-pointer text-zinc-600 hover:text-zinc-900 transition-all p-1",
                      {
                        "font-bold bg-pink-100 rounded":
                          currentChat?.id === chat.id,
                      }
                    )}
                    onClick={() => setCurrentChat(chat)}
                  >
                    {chat.title}
                  </p>
                )
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
