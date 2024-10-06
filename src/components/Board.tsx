"use client";
import { edgeTypes } from "@/components/edges";
import GradientEdge from "@/components/edges/GradientEdge";
import { nodeTypes } from "@/components/nodes";
import ResizablePane from "@/components/ResizablePane";
import { usePanel } from "@/context/panel";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Controls, ReactFlow,
  SelectionMode
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { toast } from "sonner";

export default function Board() {
  const {nodes, edges, handleNodeChange, handleEdgeChange, onConnect } = usePanel()
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
          toast.error(msg);
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
