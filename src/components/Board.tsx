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
import { Suspense, useCallback } from "react";
import { toast } from "sonner";
import { ErrorBoundary } from "react-error-boundary";

const Loader = () => (
  <div className="absolute inset-0 bg-zinc-200 flex flex-col items-center justify-center">
    <h1 className="text-[20vw] font-bold text-white animate-pulse">
      Loading...
    </h1>
  </div>
);

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
  const { onConnect, edges, nodes, setEdges, setNodes } = usePanel();
  const { user } = useCurrentUser();
  const rfStyle = {
    background: "#edf1f5",
  };

  const handleNodeChange = useCallback(
    (changes: NodeChange[]) => {
      // @ts-ignore
      setNodes((nds) => applyNodeChanges(changes, nds));
      debouncedSaveNodes(user?.uid as string, boardId, nodes);
    },
    [boardId, nodes, setNodes, user?.uid]
  );

  const handleEdgeChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      debouncedSaveEdges(user?.uid as string, boardId, edges);
    },
    [boardId, edges, setEdges, user?.uid]
  );

  return (
    <div className="w-full h-[calc(100vh-56px)] overflow-hidden">
      <ErrorBoundary
        fallback={
          <h1 className="text-2xl lg:text-5xl text-center">
            Something went wrong! Please refresh the page
          </h1>
        }
      >
        <Suspense fallback={<Loader />}>
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
            color="red"
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
            // deleteKeyCode={null}
          >
            <Background />
            <Controls />
            <ResizablePane />
          </ReactFlow>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
