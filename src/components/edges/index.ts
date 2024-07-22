import type { Edge, EdgeTypes } from "@xyflow/react";
import CustomEdge from "./CustomEdge";

export const initialEdges = [
  { id: "a->c", source: "a", target: "c", animated: true },
  { id: "b->d", source: "b", target: "d" },
  {
    id: "c->d",
    source: "c",
    target: "d",
    animated: true,
  },
] satisfies Edge[];

export const edgeTypes = {
  customEdge: CustomEdge,
} satisfies EdgeTypes;
