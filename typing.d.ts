import { Edge, Node } from "@xyflow/react";
import { ChatRequestOptions, Message } from "ai";
import { Timestamp } from "firebase/firestore";
import React from "react";

export interface User {
  uid: string;
  name: string;
  photoURL?: string;
  email: string;
}

export interface Board {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  notes: string;
  createdAt: Timestamp;
  userId: string;
}

export interface Chat {
  id: string;
  title: string | null;
  createdAt: Date;
}

export interface UserDetails {
  email: string;
  name: string;
}

export interface Model {
  id: "google-generative-ai" | "mistral";
  name: "Mistral AI" | "Google Generative AI";
}

export interface ChatStore {
  boardId: string;
  nodeId: string;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setMessages: (messages: Message[]) => void;
  currentChat: Chat | null;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setHasFetchedMessages: React.Dispatch<React.SetStateAction<boolean>>;
  isAIThinking: boolean;
  hasFetchedMessages: boolean;
  messages: Message[];
  model: Model;
  setModel: React.Dispatch<React.SetStateAction<Model>>;
  handleInputChange: (e: React.ChangeEvent<React.HTMLTextAreaElement>) => void;
  input: string;
  handleSubmit: (
    event: { preventDefault: () => void },
    chatRequestOptions: ChatRequestOptions
  ) => void;
  isLoading: boolean;

  setIsAIThinking: React.Dispatch<React.SetStateAction<boolean>>;
}
