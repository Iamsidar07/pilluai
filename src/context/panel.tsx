"use client";
import { AppNode } from "@/components/nodes";
import { db } from "@/firebase";
import { NODE_LIMITS } from "@/lib/config";
import { debounce } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  addEdge,
  Edge,
  EdgeChange,
  MarkerType,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import React, { useCallback, useContext, useEffect } from "react";
import { toast } from "sonner";

interface IPanelContext {
  nodes: AppNode[] | [];
  edges: Edge[] | [];
  setNodes: React.Dispatch<React.SetStateAction<AppNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: OnEdgesChange<Edge>;
  onNodesChange: OnNodesChange<AppNode>;
  handleNodeChange: (changes: NodeChange<AppNode>[]) => void;
  handleEdgeChange: (changes: EdgeChange<Edge>[]) => void;
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
  handleNodeChange: () => {},
  handleEdgeChange: () => {},
});

const debouncedSaveNodes = debounce(
  async (userId: string, boardId: string, nodes: Node[]) => {
    if (!boardId || !nodes || nodes.length === 0 || !userId) return;
    try {
      const boardRef = doc(db, `users/${userId}/boards`, boardId);
      await updateDoc(boardRef, { nodes });
    } catch (e) {
      console.log(e);
      toast.error("Failed to save nodes");
      return;
    }
  },
  500,
);

const debouncedSaveEdges = debounce(
  async (userId: string, boardId: string, edges: Edge[]) => {
    if (!boardId || !edges || edges.length === 0 || !userId) return;
    const boardRef = doc(db, `users/${userId}/boards`, boardId as string);
    try {
      await updateDoc(boardRef, { edges });
    } catch (e) {
      console.log(e);
      toast.error("Failed to save edges");
      return;
    }
  },
  500,
);

const PanelContextProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const boardId = params.boardId as string;
  const { user } = useUser();
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);

  useEffect(() => {
    if (!user || !boardId) return;
    const getBoard = async (userId: string, boardId: string) => {
      try {
        const docRef = doc(db, `users/${userId}/boards`, boardId);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();
        setNodes(data?.nodes);
        setEdges(data?.edges);
      } catch (error) {
        toast.error("Please check your network connection.");
        console.log("error while getting docs: ", error);
      }
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
        toast.error("Please check your network connection.");
        console.log(e);
      }
    },
    [boardId, user],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      console.log("onConnect", connection);
      if (!connection.source || !connection.target) return;
      console.log("Saving...");
      const edge = {
        ...connection,
        animated: true,
        type: "customEdge",
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((edges) => addEdge(edge, edges));
      const saveEdgesDebounced = debounce(
        () => saveEdges([...edges, edge]),
        1000,
      );
      saveEdgesDebounced();
    },
    [saveEdges, setEdges],
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

  const handleNodeChange = useCallback(
    (changes: NodeChange<AppNode>[]) => {
      onNodesChange(changes);
      debouncedSaveNodes(user?.id as string, boardId, nodes);
    },
    [onNodesChange, user?.id, boardId, nodes],
  );
  const handleEdgeChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      onEdgesChange(changes);
      debouncedSaveEdges(user?.id as string, boardId, nodes);
    },
    [onEdgesChange, user?.id, boardId, nodes],
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
        handleNodeChange,
        handleEdgeChange,
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
