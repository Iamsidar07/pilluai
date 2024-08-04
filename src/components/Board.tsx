"use client";
import { edgeTypes } from "@/components/edges";
import GradientEdge from "@/components/edges/GradientEdge";
import { nodeTypes } from "@/components/nodes";
import ResizablePane from "@/components/ResizablePane";
import useCurrentUser from "@/context/currentUser";
import { usePanel } from "@/context/panel";
import { db } from "@/firebase";
import { debounce } from "@/lib/utils";
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Edge,
  EdgeChange,
  NodeChange,
  ReactFlow,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { doc, updateDoc } from "firebase/firestore";
import { useCallback } from "react";
import { toast } from "sonner";

// Ensure that the save functions are properly debounced
const debouncedSaveNodes = debounce(
  async (userId: string, boardId: string, nodes: Node[]) => {
    console.log("saveNodes");
    if (!boardId || !nodes || nodes.length === 0 || !userId) return;
    try {
      const boardRef = doc(db, `users/${userId}/boards`, boardId);
      console.log("boardRef", boardRef, nodes, boardId);
      await updateDoc(boardRef, { nodes });
    } catch (e) {
      console.log(e);
      toast.error("Failed to save nodes");
      return;
    }
  },
  1000,
);

const debouncedSaveEdges = debounce(
  async (userId: string, boardId: string, edges: Edge[]) => {
    console.log("saveEdges");

    if (!boardId || !edges || edges.length === 0 || !userId) return;
    const boardRef = doc(db, `users/${userId}/boards`, boardId as string);
    try {
      console.log("boardRef", boardRef, edges);
      await updateDoc(boardRef, { edges });
    } catch (e) {
      console.log(e);
      toast.error("Failed to save edges");
      return;
    }
  },
  1000,
);

interface BoardProps {
  boardId: string;
}

export default function Board({ boardId }: BoardProps) {
  const { onConnect, edges, nodes, setEdges, setNodes } = usePanel();
  const { user } = useCurrentUser();
  console.log(nodes);
  const rfStyle = {
    background: "#edf1f5",
  };

  const handleNodeChange = useCallback(
    (changes: NodeChange[]) => {
      console.log("node change");
      // @ts-ignore
      setNodes((nds) => applyNodeChanges(changes, nds));
      debouncedSaveNodes(user?.uid as string, boardId, nodes);
    },
    [boardId, nodes, setNodes, user?.uid],
  );

  const handleEdgeChange = useCallback(
    (changes: EdgeChange[]) => {
      console.log("edge change");
      setEdges((eds) => applyEdgeChanges(changes, eds));
      debouncedSaveEdges(user?.uid as string, boardId, edges);
    },
    [boardId, edges, setEdges, user?.uid],
  );

  return (
    <div className="w-full h-[calc(100vh-56px)] overflow-hidden">
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
        style={rfStyle}
        deleteKeyCode={null}
      >
        <Background />
        <Controls />
        <ResizablePane />
      </ReactFlow>
    </div>
  );
}
