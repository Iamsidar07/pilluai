"use client";
import { AppNode } from "@/components/nodes";
import { db } from "@/firebase";
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
import React, { useCallback, useContext, useEffect, useMemo } from "react";
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
    }
  },
  500,
);

const debouncedSaveEdges = debounce(
  async (userId: string, boardId: string, edges: Edge[]) => {
    if (!boardId || !edges || edges.length === 0 || !userId) return;
    const boardRef = doc(db, `users/${userId}/boards`, boardId);
    try {
      await updateDoc(boardRef, { edges });
    } catch (e) {
      console.log(e);
      toast.error("Failed to save edges");
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
    if (!user?.id || !boardId) return;
    
    let isMounted = true;
    const getBoard = async () => {
      try {
        const docRef = doc(db, `users/${user.id}/boards`, boardId);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();
        if (isMounted) {
          setNodes(data?.nodes || []);
          setEdges(data?.edges || []);
        }
      } catch (error) {
        console.log("error while getting docs: ", error);
        toast.error("Please check your network connection.");
      }
    };
    getBoard();
    return () => { isMounted = false };
  }, [user?.id, boardId, setNodes, setEdges]);

  const saveEdges = useCallback(
    async (edges: Edge[]) => {
      if (!user?.id || !edges.length) return;
      try {
        const boardRef = doc(db, `users/${user.id}/boards`, boardId);
        await updateDoc(boardRef, { edges });
      } catch (e) {
        console.log(e);
        toast.error("Please check your network connection.");
      }
    },
    [boardId, user?.id],
  );

  const onConnect = useCallback<OnConnect>(
    (connection) => {
      if (!connection.source || !connection.target) return;
      
      const edge = {
        ...connection,
        animated: true,
        type: "customEdge",
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      
      setEdges(edges => {
        const newEdges = addEdge(edge, edges);
        debounce(() => saveEdges(newEdges), 1000)();
        return newEdges;
      });
    },
    [saveEdges, setEdges],
  );

  const addNode = useCallback(
    (node: AppNode) => {
      setNodes(nds => [...nds, node]);
    },
    [setNodes],
  );

  const updateNode = useCallback(
    ({ id, data = {}, type }: { id: string; data: any; type: string }) => {
      setNodes(nds => 
        nds.map(node => 
          node.id === id && node.type === type
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      );
    },
    [setNodes],
  );

  const handleNodeChange = useCallback(
    (changes: NodeChange<AppNode>[]) => {
      onNodesChange(changes);
      if (user?.id) {
        debouncedSaveNodes(user.id, boardId, nodes);
      }
    },
    [onNodesChange, user?.id, boardId, nodes],
  );

  const handleEdgeChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      onEdgesChange(changes);
      if (user?.id) {
        debouncedSaveEdges(user.id, boardId, nodes);
      }
    },
    [onEdgesChange, user?.id, boardId, nodes],
  );

  const contextValue = useMemo(() => ({
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
  }), [
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
  ]);

  return (
    <PanelContext.Provider value={contextValue}>
      {children}
    </PanelContext.Provider>
  );
};

export const usePanel = () => useContext(PanelContext);

export default PanelContextProvider;
