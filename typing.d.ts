import { Edge, Node } from "@xyflow/react";
import { Timestamp } from "firebase/firestore";

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

export interface UserDetails {
  email: string;
  name: string;
}
