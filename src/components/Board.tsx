"use client";
import { edgeTypes } from "@/components/edges";
import GradientEdge from "@/components/edges/GradientEdge";
import { AppNode, nodeTypes } from "@/components/nodes";
import ResizablePane from "@/components/ResizablePane";
import { usePanel } from "@/context/panel";
import { db } from "@/firebase";
import { debounce } from "@/lib/utils";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  Edge,
  EdgeChange,
  MarkerType,
  NodeChange,
  OnConnect,
  ReactFlow,
  SelectionMode,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface BoardProps {
  boardId: string;
}

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

export default function Board({ boardId }: BoardProps) {
  const { user } = useUser();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  useEffect(() => {
    const getBoard = async () => {
      const docRef = doc(db, `users/${user?.id}/boards`, boardId);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      setNodes(data?.nodes);
      setEdges(data?.edges);
    };
    getBoard();
  }, [boardId, setNodes, setEdges, user?.id]);

  const handleNodeChange = useCallback(
    (changes) => {
      console.log("handleNodeChange", changes);
      onNodesChange(changes);
      debouncedSaveNodes(user?.id as string, boardId, nodes);
    },
    [onNodesChange, user?.id, boardId, nodes],
  );
  const handleEdgeChange = useCallback(
    (changes) => {
      console.log("handleEdgeChange", changes);
      onEdgesChange(changes);
      debouncedSaveEdges(user?.id as string, boardId, nodes);
    },
    [onEdgesChange, user?.id, boardId, nodes],
  );

  // const onConnect = useCallback(
  //   (params) => setEdges((eds) => addEdge(params, eds)),
  //   [setEdges],
  // );

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
  const memoizedFlow = useMemo(
    () => (
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodeChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={handleEdgeChange}
        fitView
        onConnect={onConnect}
        panOnScroll
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        connectionMode={ConnectionMode.Strict}
        connectionLineType={ConnectionLineType.SmoothStep}
        elevateEdgesOnSelect
        elevateNodesOnSelect
        nodesDraggable={true}
        onError={(e, msg) => {
          console.log(e, msg);
        }}
        connectionRadius={10}
        zoomOnPinch
      >
        <Background variant={BackgroundVariant.Dots} bgColor="#edf1f5" />
        <Controls showFitView showInteractive />
        <ResizablePane />
      </ReactFlow>
    ),
    [edges, handleEdgeChange, handleNodeChange, nodes, onConnect],
  );

  return (
    <div className="w-full h-[calc(100vh-52px)] sm:h-[calc(100vh-57px)] overflow-hidden">
      <GradientEdge />
      {memoizedFlow}
    </div>
  );
}
