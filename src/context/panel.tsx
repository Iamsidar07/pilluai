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
    useNodesState
} from "@xyflow/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import React, { useCallback, useContext, useEffect } from "react";

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

const getBoard = async (boardId: string) => {
  const docRef = doc(db, "boards", boardId);
  const docSnap = await getDoc(docRef);
  return docSnap?.data();
};
const PanelContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { boardId } = useParams();
  const { data: boardData, error } = useQuery({
    queryKey: [boardId, "board"],
    queryFn: () => getBoard(boardId as string),
  });

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    boardData?.edges,
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(
    boardData?.nodes,
  );

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
      const boardRef = doc(db, "boards", boardId as string);
      updateDoc(boardRef, {
        edges: edges,
      });
    },
    [boardId],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      console.log("Connect")
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
