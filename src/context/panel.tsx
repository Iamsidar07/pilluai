"use client";
import { AppNode } from "@/components/nodes";
import { db } from "@/firebase";
import { debounce } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
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
import useCurrentUser from "./currentUser";

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
  const { boardId } = useParams();
  const { user } = useCurrentUser();
  const [boardData, setBoardData] = useState<Board | undefined>(undefined);

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    boardData?.edges || [],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(
    boardData?.nodes || [],
  );

  useEffect(() => {
    const getBoard = async () => {
      if (!user?.uid || !boardId) return null;
      try {
        const docRef = doc(db, `users/${user.uid}/boards`, boardId as string);
        const docSnap = await getDoc(docRef);
        console.log("boardData", docSnap?.data());
        setBoardData({ id: docSnap.id, ...docSnap.data() } as Board);
      } catch (e) {
        console.log(e);
      }
    };
    getBoard();
  }, [user?.uid, boardId]);

  useEffect(() => {
    if (boardData && boardData.nodes) {
      setNodes(boardData.nodes);
    }
    if (boardData && boardData.edges) {
      setEdges(boardData.edges);
    }
  }, [boardData, setEdges, setNodes]);

  const saveEdges = useCallback(
    // @ts-ignore
    async (edges) => {
      console.log("saveEdges");
      try {
        const boardRef = doc(
          db,
          `users/${user?.uid}/boards`,
          boardId as string,
        );
        updateDoc(boardRef, {
          edges: edges,
        });
      } catch (e) {
        console.log(e);
      }
    },
    [boardId, user?.uid],
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
        1000,
      );
      saveEdgesDebounced();
    },
    [edges, saveEdges, setEdges],
  );

  const addNode = useCallback(
    (node: AppNode) => {
      setNodes((nds) => [...nds, node]);
    },
    [setNodes],
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
        }),
      );
    },
    [setNodes],
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
