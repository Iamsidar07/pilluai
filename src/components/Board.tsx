"use client";
import { edgeTypes } from "@/components/edges";
import GradientEdge from "@/components/edges/GradientEdge";
import { nodeTypes } from "@/components/nodes";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { doc, updateDoc } from "firebase/firestore";
import { useCallback } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

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
  1000
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
  1000
);

interface BoardProps {
  boardId: string;
}

export default function Board({ boardId }: BoardProps) {
  const { user } = useUser();
  const { onConnect, edges, nodes, setEdges, setNodes } = usePanel();

  const handleNodeChange = useCallback(
    (changes: NodeChange[]) => {
      // @ts-ignore
      setNodes((nds) => applyNodeChanges(changes, nds));
      debouncedSaveNodes(user?.id as string, boardId, nodes);
    },
    [boardId, nodes, setNodes, user?.id]
  );

  const handleEdgeChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      debouncedSaveEdges(user?.id as string, boardId, edges);
    },
    [boardId, edges, setEdges, user?.id]
  );

  return (
    <div className="w-full h-full overflow-hidden">
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
        colorMode="light"
        autoPanOnConnect
        autoPanOnNodeDrag
        autoPanSpeed={0.5}
        connectOnClick
        connectionMode={ConnectionMode.Strict}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultMarkerColor="yellow"
        elevateEdgesOnSelect
        elevateNodesOnSelect
        nodesDraggable
        onError={(_, msg) => toast.error(msg)}
        onlyRenderVisibleElements
        connectionRadius={10}
        className="grainy-light"
      >
        <Background variant={BackgroundVariant.Dots} bgColor="#edf1f5" />
        <Controls showFitView showInteractive />
        <ResizablePane />
      </ReactFlow>
    </div>
  );
}
