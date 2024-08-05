"use client";
import { AppNode } from "@/components/nodes";
import { db } from "@/firebase";
import { debounce } from "@/lib/utils";
import {
  addEdge,
  Edge,
  MarkerType,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import React, { useCallback, useContext, useEffect, useState } from "react";
import useCurrentUser from "./currentUser";
import { useDocument } from "react-firebase-hooks/firestore";
import useSubscription from "@/hooks/useSubscription";
import { toast } from "sonner";

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

interface Board {
  id: string;
  nodes: AppNode[];
  edges: Edge[];
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

const PanelContextProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const boardId = params.boardId as string;
  const { hasActiveMembership } = useSubscription();
  const { user } = useCurrentUser();
  const [boardData, setBoardData] = useState<Board | undefined>(undefined);

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    boardData?.edges || []
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(
    boardData?.nodes || []
  );
  const [snapshot, loading, err] = useDocument(
    user && boardId ? doc(db, `users/${user.uid}/boards`, boardId) : null
  );
  console.log("err", err);
  useEffect(() => {
    if (!snapshot) return;
    const data = snapshot.data();
    if (!data) return;
    setBoardData({ id: snapshot.id, ...data } as Board);
    setNodes(data?.nodes);
    setEdges(data?.edges);
  }, [setEdges, setNodes, snapshot]);

  const saveEdges = useCallback(
    // @ts-ignore
    async (edges) => {
      console.log("saveEdges");
      try {
        const boardRef = doc(
          db,
          `users/${user?.uid}/boards`,
          boardId as string
        );
        updateDoc(boardRef, {
          edges: edges,
        });
      } catch (e) {
        console.log(e);
      }
    },
    [boardId, user?.uid]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) return;
      const edge = {
        ...connection,
        animated: true,
        type: "customEdge",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#00ff00" },
      };
      setEdges((edges) => addEdge(edge, edges));
      const saveEdgesDebounced = debounce(
        () => saveEdges([...edges, edge]),
        1000
      );
      saveEdgesDebounced();
    },
    [edges, saveEdges, setEdges]
  );

  const addNode = useCallback(
    (node: AppNode) => {
      // limit the nodes
      const pdfNodes = nodes.filter((nd) => nd.type === "pdfNode");
      // free user and have pdfnode more than 1
      if (!hasActiveMembership && pdfNodes.length > 1) {
        return toast.error("Reached the limit of pdf node");
      }
      if (hasActiveMembership && pdfNodes.length > 7) {
        return toast.error("Reached the limit of pdf node");
      }
      const imageNodes = nodes.filter((nd) => nd.type === "imageNode");
      if (!hasActiveMembership && imageNodes.length > 2) {
        return toast.error("Reached the limit of image node");
      }
      if (hasActiveMembership && pdfNodes.length > 15) {
        return toast.error("Reached the limit of image node");
      }

      const webScrapperNodes = nodes.filter(
        (nd) => nd.type === "webScrapperNode"
      );
      if (!hasActiveMembership && webScrapperNodes.length > 1) {
        return toast.error("Reached the limit of website node");
      }
      if (hasActiveMembership && webScrapperNodes.length > 7) {
        return toast.error("Reached the limit of website node");
      }
      const youtubeNodes = nodes.filter((nd) => nd.type === "youtubeNode");
      if (!hasActiveMembership && youtubeNodes.length > 1) {
        return toast.error("Reached the limit of youtube video node");
      }
      if (hasActiveMembership && youtubeNodes.length > 7) {
        return toast.error("Reached the limit of youtube video node");
      }
      const chatNodes = nodes.filter((nd) => nd.type === "chatNode");
      if (!hasActiveMembership && chatNodes.length > 1) {
        return toast.error("Reached the limit of chat node");
      }
      if (hasActiveMembership && chatNodes.length > 5) {
        return toast.error("Reached the limit of chat node");
      }
      setNodes((nds) => [...nds, node]);
    },
    [setNodes, nodes, hasActiveMembership]
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
        })
      );
    },
    [setNodes]
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
