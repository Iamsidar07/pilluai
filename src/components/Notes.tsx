"use client";
import { db } from "@/firebase";
import { debounce } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Panel } from "@xyflow/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { JSONContent } from "novel";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./editor/Editor"), {
  ssr: false,
  loading: () => <Loader2 className="w-4 h-4 animate-spin mx-auto mt-4" />,
});

const getBoard = async (userId: string, boardId: string) => {
  const docRef = doc(db, `users/${userId}/boards/${boardId}`);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
};

const Notes = () => {
  const { userId } = useAuth();
  const params = useParams();
  const [initialContent, setInitialContent] = useState<JSONContent | null>(
    null,
  );
  const {
    data: boardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["board", params.boardId],
    queryFn: () => getBoard(userId!, params.boardId as string),
  });

  const [saveStatus, setSaveStatus] = useState("Save");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (boardData && boardData.name) {
      setTitle(boardData.name);
      setInitialContent(
        boardData.notes
          ? JSON.parse(boardData.notes)
          : { type: "doc", content: [] },
      );
    }
  }, [boardData, boardData?.name]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) {
      toast.error("Please login to continue");
      return;
    }
    const docRef = doc(
      db,
      `users/${userId}/boards/${params.boardId as string}`,
    );
    updateDoc(docRef, {
      name: e.target.value,
    });
  };

  return (
    <Panel
      position="top-right"
      className="relative bg-white px-2 w-full border-l overflow-auto h-[calc(100vh-56px)] !m-0"
    >
      <div className="border-b bg-white sticky top-0 z-10">
        {isLoading && <Skeleton className="h-6 w-32" />}
        {error && <p className="text-red-500">Failed to load notes</p>}
        <input
          className="bg-transparent py-2 outline-none w-full font-bold"
          placeholder="Board Name"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            const handleTitleChangeDebounced = debounce(
              () => handleTitleChange(e),
              200,
            );
            handleTitleChangeDebounced();
          }}
        />
        <p className="ml-auto text-right text-sm text-zinc-400">{saveStatus}</p>
      </div>
      {initialContent ? (
        <Editor
          initialContent={initialContent}
          boardId={params.boardId as string}
          setSaveStatus={setSaveStatus}
        />
      ) : (
        <Loader2 className="w-5 h-5 animate-spin mt-6 mx-auto" />
      )}
    </Panel>
  );
};

export default Notes;
