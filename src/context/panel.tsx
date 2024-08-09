"use client";
import { AppNode } from "@/components/nodes";
import { db } from "@/firebase";
import { debounce } from "@/lib/utils";
import {
  addEdge,
  Edge,
  MarkerType,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import React, { useCallback, useContext, useEffect, useState } from "react";
import useSubscription from "@/hooks/useSubscription";
import { toast } from "sonner";
import { NODE_LIMITS } from "@/lib/config";
import { useUser } from "@clerk/nextjs";

interface IPanelContext {
  nodes: AppNode[] | [];
  edges: Edge[] | [];
  setNodes: React.Dispatch<React.SetStateAction<AppNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: OnEdgesChange<Edge>;
  onNodesChange: OnNodesChange<AppNode>;
  onConnect: OnConnect;
  addNode: (node: AppNode) => void;
  updateNode: ({
    id,
    data,
    type,
  }: {
    id: string;
    data: any;
    type: string;
  }) => void;
}

interface Board {
  id: string;
  nodes: AppNode[];
  edges: Edge[];
}

export const PanelContext = React.createContext<IPanelContext>({
  nodes: [],
  edges: [],
  setNodes: () => {},
  setEdges: () => {},
  onNodesChange: () => {},
  onEdgesChange: () => {},
  onConnect: () => {},
  addNode: () => {},
  updateNode: () => {},
});

const PanelContextProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const boardId = params.boardId as string;
  const { hasActiveMembership } = useSubscription();
  const { user } = useUser();
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);

  useEffect(() => {
    if (!user || !boardId) return;
    const getBoard = async (userId: string, boardId: string) => {
      const docRef = doc(db, `users/${userId}/boards`, boardId);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      setNodes(data?.nodes);
      setEdges(data?.edges);
    };
    getBoard(user?.id, boardId);
  }, [user, boardId, setNodes, setEdges]);

  const saveEdges = useCallback(
    // @ts-ignore
    async (edges) => {
      console.log("saveEdges");
      if (!user) return;
      try {
        const boardRef = doc(db, `users/${user?.id}/boards`, boardId as string);
        updateDoc(boardRef, {
          edges: edges,
        });
      } catch (e) {
        console.log(e);
      }
    },
    [boardId, user]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) return;
      const edge = {
        ...connection,
        animated: true,
        type: "customEdge",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#00ff00" },
      };
      setEdges((edges) => addEdge(edge, edges));
      const saveEdgesDebounced = debounce(
        () => saveEdges([...edges, edge]),
        1000
      );
      saveEdgesDebounced();
    },
    [saveEdges, setEdges]
  );

  const addNode = useCallback(
    (node: AppNode) => {
      setNodes((nds) => {
        const nodeType = node.type as keyof typeof NODE_LIMITS;
        const limit = hasActiveMembership
          ? NODE_LIMITS[nodeType].active
          : NODE_LIMITS[nodeType].free;

        const nodeCount = nds.filter((nd) => nd.type === nodeType).length;

        if (nodeCount >= limit) {
          toast.error(`Reached the limit of ${nodeType}`);
          return nds;
        }
        return [...nds, node];
      });
    },
    [hasActiveMembership, setNodes]
  );

  const updateNode = useCallback(
    ({ id, data = {}, type }: { id: string; data: any; type: string }) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id && node.type === type) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  return (
    <PanelContext.Provider
      value={{
        nodes,
        edges,
        setNodes,
        setEdges,
        onEdgesChange,
        onNodesChange,
        onConnect,
        addNode,
        updateNode,
      }}
    >
      {children}
    </PanelContext.Provider>
  );
};

export const usePanel = () => {
  return useContext(PanelContext);
};

export default PanelContextProvider;
