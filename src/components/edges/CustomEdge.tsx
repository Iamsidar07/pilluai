"use client";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  MarkerType,
  useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import { RxCross1 } from "react-icons/rx";

import "./buttonedge.css";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {
    stroke: "url(#edgegradient)",
  },
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [hovered, setHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <BaseEdge path={edgePath} markerEnd={MarkerType.Arrow} style={style} />
      {hovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 24,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            <button
              className="w-12 h-12 rounded-full bg-red-500 text-white border-2 border-white shadow-lg hover:border-3 hover:shadow-2xl grid place-content-center hover:scale-125 transition-transform"
              onClick={onEdgeClick}
            >
              <RxCross1 className="w-4 h-4" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  );
}
