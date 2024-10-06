import { AppNode } from "@/components/nodes";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export const parseAsObject = (str: string) => {
  let parsedStr = str;
  if (str.startsWith("```json")) {
    parsedStr = str.replaceAll("```", "").replaceAll("json", "");
    return JSON.parse(parsedStr);
  }
  return JSON.parse(parsedStr);
};

export const debounce = (fn: Function, ms = 800) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const isValidYoutubeUrl = (url: string) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return pattern.test(url);
};

export const getNewNodePosition = (nodes: AppNode[]) => {
  const existingNodes =
    nodes.length > 0 ? nodes : [{ position: { x: 0, y: 0 } }]; // Fallback if no nodes exist
  const lastNode = existingNodes[0]; // Get the last node
  const newPosition = {
    x: lastNode.position.x + 20, // Offset the new node by 100px to the right
    y: lastNode.position.y - 10, // Keep the same y-coordinate
  };
  return newPosition;
};
