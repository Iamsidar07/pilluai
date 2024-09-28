"use client";
import { edgeTypes } from "@/components/edges";
import GradientEdge from "@/components/edges/GradientEdge";
import { AppNode, nodeTypes } from "@/components/nodes";
import ResizablePane from "@/components/ResizablePane";
import { usePanel } from "@/context/panel";
import { db } from "@/firebase";
import { debounce } from "@/lib/utils";
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  Edge,
  EdgeChange,
  NodeChange,
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
  const { onConnect } = usePanel();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
      onNodesChange(changes);
      debouncedSaveNodes(user?.id as string, boardId, nodes);
    },
    [onNodesChange, user?.id, boardId, nodes],
  );
  const handleEdgeChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      debouncedSaveEdges(user?.id as string, boardId, nodes);
    },
    [onEdgesChange, user?.id, boardId, nodes],
  );

  const memoizedFlow = useMemo(
    () => (
      <div className="w-full h-[calc(100vh-52px)] sm:h-[calc(100vh-57px)] overflow-hidden">
        <GradientEdge />
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
          connectionMode={ConnectionMode.Loose}
          connectionLineType={ConnectionLineType.SmoothStep}
          elevateEdgesOnSelect
          elevateNodesOnSelect
          nodesDraggable={true}
          onError={(_, msg) => toast.error(msg)}
          connectionRadius={10}
          zoomOnPinch
        >
          <Background variant={BackgroundVariant.Dots} bgColor="#edf1f5" />
          <Controls showFitView showInteractive />
          <ResizablePane />
        </ReactFlow>
      </div>
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
