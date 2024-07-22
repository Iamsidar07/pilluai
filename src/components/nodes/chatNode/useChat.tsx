"use client";
import { usePanel } from "@/context/panel";
import { db } from "@/firebase";
import { useUserStore } from "@/store/userStore";
import { Message, useChat as useChatAI } from "ai/react";
import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    onSnapshot,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { nanoid } from "nanoid";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface Chat {
  id: string;
  title: string;
  userId: string;
  nodeId: string;
  messagesId: string;
  createdAt: Timestamp;
}

const useChat = ({ nodeId }: { nodeId: string }) => {
  const { user } = useUserStore();
  const userId = useMemo(() => user?.uid, [user?.uid]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { nodes, edges } = usePanel();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [userMessageContent, setUserMessageContent] = useState("");
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(false);

  const {
    input,
    handleSubmit,
    handleInputChange,
    setInput,
    messages,
    setMessages,
  } = useChatAI({
    initialMessages: initialMessages,
    onFinish: useCallback(
      async (newMessage: Message) => {
        if (!currentChat) return;
        // Save message to the db
        const currentChatId = currentChat.id;
        const currentMessagesId = currentChat.messagesId;

        const messagesCollectionRef = doc(
          db,
          "chats",
          currentChatId,
          "messages",
          currentMessagesId,
        );
        const newUserMessage: Message = {
          id: nanoid(),
          role: "user",
          content: userMessageContent,
        };

        // Add a new message document
        await updateDoc(messagesCollectionRef, {
          chatId: currentChatId,
          userId,
          messages: arrayUnion(...[newUserMessage, newMessage]),
        });
      },
      [currentChat, userId, userMessageContent],
    ),
  });
  const createNewMessagesCollectionItem = useCallback(
    async (chatId: string, userId: string) => {
      const messagesCollectionRef = collection(db, "chats", chatId, "messages");

      const docSnap = await addDoc(messagesCollectionRef, {
        chatId,
        userId,
        messages: [],
      });
      return docSnap.id;
    },
    [],
  );

  const handleNewChat = useCallback(
    async (title = "") => {
      if (!userId) return;
      setInput("");
      setMessages([]);
      try {
        const newChatId = nanoid();
        const messagesId = await createNewMessagesCollectionItem(
          newChatId,
          userId,
        );

        const chatDocRef = doc(db, "chats", newChatId);
        const chat = {
          title,
          nodeId,
          userId,
          createdAt: Timestamp.now(),
          messagesId: messagesId,
        };
        await setDoc(chatDocRef, chat);
        setCurrentChat({
          id: newChatId,
          title,
          nodeId,
          userId,
          createdAt: Timestamp.now(),
          messagesId: messagesId,
        });
        return { id: newChatId, ...chat };
      } catch (error) {
        console.log("failed to create chat", error);
      }
    },
    [setInput, setMessages, createNewMessagesCollectionItem, nodeId, userId],
  );
  const getMyChats = useCallback(() => {
    try {
      setIsChatsLoading(true);
      const chatsCollectionRef = collection(db, "chats");
      const chatsQuery = query(
        chatsCollectionRef,
        where("userId", "==", userId),
        where("nodeId", "==", nodeId),
      );

      const unsubscribe = onSnapshot(chatsQuery, (chatsSnapshot) => {
        const chatsData = chatsSnapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            }) as Chat,
        );
        setChats(chatsData);
        if (!(chatsData.length > 0)) {
          console.log("NEW CHAT");
          handleNewChat();
        }
      });

      return unsubscribe;
    } catch (e) {
      console.log("Failed to get chats", e);
    } finally {
      setIsChatsLoading(false);
    }
  }, [handleNewChat, nodeId, userId]);

  const getCurrentChatMessages = useCallback(
    (chatId: string, messagesId: string) => {
      const messagesDocRef = doc(db, "chats", chatId, "messages", messagesId);

      const unsubscribe = onSnapshot(messagesDocRef, (messagesDocSnap) => {
        const messagesData = messagesDocSnap.data();
        if (messagesData) {
          setInitialMessages(messagesData.messages as Message[]);
          // setMessages(messagesData.messages);
        }
      });

      return unsubscribe;
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = getMyChats();
    if (unsubscribe === undefined) return;
    return () => unsubscribe();
  }, [getMyChats]);

  useEffect(() => {
    if (currentChat?.id && currentChat?.messagesId) {
      const unsubscribe = getCurrentChatMessages(
        currentChat?.id,
        currentChat?.messagesId,
      );
      return () => unsubscribe();
    }
  }, [
    currentChat,
    currentChat?.id,
    currentChat?.messagesId,
    getCurrentChatMessages,
  ]);

  useEffect(() => {
    if (chats && chats.length > 0 && !currentChat) {
      setCurrentChat(chats[0]);
    }
  }, [chats, currentChat]);

  useEffect(() => {
    if (currentChat) {
      setMessages(initialMessages);
    }
  }, [currentChat, initialMessages, setMessages]);

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
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (input.trim() === "") return;
      setUserMessageContent(input);
      const knowledgeBaseNodes = getKnowledgeBaseNodes(nodeId);
      const newMessage: Message = {
        id: nanoid(),
        role: "user",
        content: input,
      };

      try {
        const currentTitle = currentChat?.title || "";
        if (currentChat && currentTitle.trim() === "") {
          const chatDocRef = doc(db, "chats", currentChat?.id || "");
          await updateDoc(chatDocRef, {
            title: newMessage.content,
          });
          handleSubmit(e, {
            options: {
              body: {
                action: "world",
                actionId: nanoid(),
                knowledgeBaseNodes: knowledgeBaseNodes,
                node: nodes.find((node) => node.id === nodeId),
                nodeId,
                responseMode: "smart",
                userId: userId,
                chatId: currentChat?.id,
                messagesId: currentChat?.messagesId,
              },
            },
          });
          return;
        } else if (!currentChat) {
          const chat = await handleNewChat(input);

          handleSubmit(e, {
            options: {
              body: {
                action: "world",
                actionId: nanoid(),
                knowledgeBaseNodes: knowledgeBaseNodes,
                node: nodes.find((node) => node.id === nodeId),
                nodeId,
                responseMode: "smart",
                userId: userId,
                chatId: chat?.id,
                messagesId: chat?.messagesId,
              },
            },
          });
          return;
        }

        handleSubmit(e, {
          options: {
            body: {
              action: "world",
              actionId: nanoid(),
              knowledgeBaseNodes: knowledgeBaseNodes,
              node: nodes.find((node) => node.id === nodeId),
              nodeId,
              responseMode: "smart",
              userId: userId,
              chatId: currentChat?.id,
              messagesId: currentChat?.messagesId,
            },
          },
        });
      } catch (error) {
        console.log("Failed to update chat title", error);
      }
    },
    [
      input,
      getKnowledgeBaseNodes,
      nodeId,
      currentChat,
      handleSubmit,
      nodes,
      userId,
      handleNewChat,
    ],
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages, messagesEndRef]);

  return {
    createNewMessagesCollectionItem,
    handleSendMessage,
    handleNewChat,
    input,
    setInput,
    messages,
    messagesEndRef,
    chats,
    handleInputChange,
    currentChat,
    setCurrentChat,
    initialMessages,
    setInitialMessages,
    userMessageContent,
    setUserMessageContent,
    isChatsLoading,
    setIsChatsLoading,
    getCurrentChatMessages,
    setMessages,
  };
};

export default useChat;
