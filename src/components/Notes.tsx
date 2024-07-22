"use client";
import { db } from "@/firebase";
import { debounce } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Panel } from "@xyflow/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { JSONContent } from "novel";
import React, { useEffect, useState } from "react";
import Editor from "./Editor";

const getBoard = async (boardId: string) => {
  const docRef = doc(db, "boards", boardId);
  const docSnap = await getDoc(docRef);
  console.log(docSnap.data());
  return docSnap.data();
};

const Notes = () => {
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
    queryFn: () => getBoard(params.boardId as string),
  });

  const [saveStatus, setSaveStatus] = useState("Save");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (boardData && boardData.name) {
      setTitle(boardData.name);
      setInitialContent(JSON.parse(boardData.notes));
    }
  }, [boardData, boardData?.name]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const docRef = doc(db, "boards", params.boardId as string);
    updateDoc(docRef, {
      name: e.target.value,
    });
  };

  console.log({ isLoading, error, boardData });
  return (
    <Panel
      position="top-right"
      className="bg-white p-2 w-full border-l overflow-auto h-[calc(100vh-56px)] !m-0"
    >
      <div className="border-b">
        <input
          className="bg-transparent py-2 outline-none w-full font-bold"
          placeholder="Board Name"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            const handleTitleChangeDebounced = debounce(
              () => handleTitleChange(e),
              1000,
            );
            handleTitleChangeDebounced();
          }}
        />
        <p className="ml-auto text-right text-sm text-zinc-400">{saveStatus}</p>
      </div>
      {initialContent && (
        <Editor
          initialContent={initialContent}
          boardId={params.boardId as string}
          setSaveStatus={setSaveStatus}
        />
      )}
    </Panel>
  );
};

export default Notes;
