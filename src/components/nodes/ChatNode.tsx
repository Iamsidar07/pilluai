"use client";
import CustomHandle from "@/components/CustomHandle";
import { NodeProps, NodeResizeControl, NodeResizer } from "@xyflow/react";

import ShowMessage from "@/components/ShowMessage";
import { Button } from "@/components/ui/button";
import { usePanel } from "@/context/panel";
import { db } from "@/firebase";
import useSubscription from "@/hooks/useSubscription";
import { maxChatInOneChatNode } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Message, useChat } from "ai/react";
import { collection, doc, orderBy, query, setDoc } from "firebase/firestore";
import { ArrowRightIcon, Bot, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { IoCreateOutline } from "react-icons/io5";
import { toast } from "sonner";
import { Chat } from "../../../typing";
import { useUser } from "@clerk/nextjs";

const ChatNode = ({ id: nodeId, selected }: NodeProps) => {
  const [isAIThinking, setIsAIThinking] = useState(false);
  const {
    handleInputChange,
    input,
    setInput,
    isLoading,
    handleSubmit,
    messages,
    setMessages,
  } = useChat({
    onResponse() {
      setIsAIThinking(false);
    },
    onError() {
      toast.error("Something went wrong");
    },
  });
  const { nodes, edges } = usePanel();
  const { boardId } = useParams();
  const { user } = useUser();
  const { hasUserProPlanSubscribe } = useSubscription();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  const [chatsSnapshot, loading, error] = useCollection(
    user &&
      query(
        collection(
          db,
          `users/${user.id}/boards/${boardId}/chatNodes/${nodeId}/chats`
        ),
        orderBy("createdAt", "desc")
      ),
    {
      snapshotListenOptions: {
        includeMetadataChanges: true,
      },
    }
  );

  const [messagesSnapshot] = useCollection(
    user &&
      currentChat &&
      query(
        collection(
          db,
          `users/${user.id}/boards/${boardId}/chatNodes/${nodeId}/chats/${currentChat.id}/messages`
        ),
        orderBy("createdAt", "asc")
      )
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
  }, [chatsSnapshot]);

  useEffect(() => {
    if (messagesSnapshot) {
      const newMessages = messagesSnapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as Message)
      );
      setMessages(newMessages);
    }
  }, [messagesSnapshot, currentChat, setMessages]);

  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages, messagesEndRef]);

  const handleCreateNewChat = useCallback(async () => {
    if (!hasUserProPlanSubscribe && chats.length >= maxChatInOneChatNode) {
      toast.info("You've reached the limit of new chats.");
      return;
    }
    if (!user || !boardId || !nodeId) return;
    setInput("");
    setMessages([]);
    const newChatId = nanoid();
    const chatCollectionRef = doc(
      db,
      `users/${user.id}/boards/${boardId}/chatNodes/${nodeId}/chats`,
      newChatId
    );
    await setDoc(chatCollectionRef, {
      title: null,
      createdAt: new Date(),
    });
    setCurrentChat({
      title: null,
      id: newChatId,
      createdAt: new Date(),
    } as Chat);
  }, [
    boardId,
    chats.length,
    hasUserProPlanSubscribe,
    nodeId,
    setInput,
    setMessages,
    user,
  ]);

  useEffect(() => {
    if (chatsSnapshot?.docs.length === 0 && !loading && !error) {
      // Indeed there is no chats
      handleCreateNewChat();
    }
  }, [chatsSnapshot?.docs.length, error, handleCreateNewChat, loading]);

  const getKnowledgeBaseNodes = useCallback(
    (chatNodeId: string) => {
      const knowledgeEdges = edges.filter((edge) => edge.target === chatNodeId);
      const knowledgeBaseNodeIds = knowledgeEdges.map((edge) => edge.source);
      const knowledgeBaseNodes = nodes.filter((node) =>
        knowledgeBaseNodeIds.includes(node.id)
      );
      return knowledgeBaseNodes;
    },
    [edges, nodes]
  );

  const handleSendMessage = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input || input.trim().length === 0) return;
      let currentChatId = currentChat?.id;
      setIsAIThinking(true);
      try {
        if (!currentChat) {
          const newChatId = nanoid();
          currentChatId = newChatId;
          setChats((prevChats) => [
            { id: newChatId, title: input, createdAt: new Date() },
            ...prevChats,
          ]);
          const chatCollectionRef = doc(
            db,
            `users/${user?.id}/boards/${boardId}/chatNodes/${nodeId}/chats`,
            newChatId
          );
          await setDoc(chatCollectionRef, {
            title: null,
            createdAt: new Date(),
          });
          setCurrentChat({
            id: newChatId,
            title: null,
            createdAt: new Date(),
          });
        }

        handleSubmit(e, {
          options: {
            body: {
              knowledgeBaseNodes: getKnowledgeBaseNodes(nodeId),
              userId: user?.id,
              boardId,
              nodeId,
              currentChat,
            },
          },
        });
        messages.pop();
        setInput("");
      } catch (error) {
        console.log(error);
        setMessages([
          ...messages,
          {
            id: nanoid(),
            role: "assistant",
            content: "Oops! Something went wrong. Please try again later.",
            createdAt: new Date(),
          },
        ]);
      }
    },
    [
      boardId,
      getKnowledgeBaseNodes,
      handleSubmit,
      nodeId,
      setInput,
      setMessages,
      user?.id,
      setCurrentChat,
    ]
  );

  return (
    <div className="bg-white ring-1 ring-gray-900/15 rounded border overflow-hidden flex h-full w-full">
      <NodeResizeControl color="#E00000" keepAspectRatio />
      <NodeResizer color="#E00000" keepAspectRatio />
      <CustomHandle type="target" />
      <div className="w-1/3 border-r relative">
        <div className="p-2 bg-zinc-100 h-full ">
          <div className=" flex items-center justify-end sticky">
            <Button
              size={"sm"}
              onClick={() => handleCreateNewChat()}
              className="px-2 py-1 text-sm rounded cursor-pointer flex items-center gap-1"
            >
              <IoCreateOutline className="w-4 h-4" />
              new chat
            </Button>
          </div>
          <h3 className="mt-4 mb-2 text-zinc-400">Previous Chats</h3>
          <div className="flex flex-col">
            {loading && <Loader2 className="w-5 h-5 mt-4 mx-auto" />}
            {chats?.map(
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
                    onClick={() => {
                      setCurrentChat(chat);
                    }}
                  >
                    {chat?.title || ""}
                  </p>
                )
            )}
          </div>
        </div>
      </div>
      <div className="w-2/3 p-2 nodrag nowheel cursor-text flex flex-col">
        <div className="flex flex-col flex-1 space-y-1 overflow-auto h-full pb-24 nodrag nowheel cursor-text">
          {messages?.length === 0 && !isLoading && (
            <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Bot />
              <h3>HI, How I can help you?</h3>
            </div>
          )}
          {messages?.map((message) => (
            <ShowMessage key={message.id} {...message} />
          ))}
          {isAIThinking && (
            <ShowMessage
              role="assistant"
              content="AI is thinking..."
              id="thinking"
              createdAt={new Date()}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
        <div className="px-2 pt-1 bg-white shadow-sm rounded">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 pr-1 border rounded focus-within:shadow-sm"
          >
            <input
              type="text"
              className="flex-1 p-2 text-sm outline-none bg-transparent border-none"
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => {
                handleInputChange(e);
              }}
            />
            <Button
              disabled={input.length === 0 || !currentChat?.id}
              type="submit"
              size={"icon"}
              className="rounded-full h-8 w-8"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatNode;
