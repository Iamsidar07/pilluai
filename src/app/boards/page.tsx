"use client";

import BoardItem from "@/components/BoardItem";
import DialogForm from "@/components/DialogForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { db } from "@/firebase";
import useDialog from "@/hooks/useDialog";
import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";
import { Edge, Node } from "@xyflow/react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import {
  EllipsisVertical,
  FolderPlus,
  Loader2,
  Plus
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface Board {
  id?: string;
  nodes: Node[];
  edges: Edge[];
  notes: string;
  name: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
}

const BoardSkeleton = () => {
  return (
    <div className="w-full h-20 border rounded-md p-4 flex justify-between">
      <div className="w-full">
        <Skeleton className="w-1/2 h-4 mb-2" />
        <Skeleton className="w-3/4 h-4 mb-2" />
      </div>
      <EllipsisVertical className="w-6 h-6 text-gray-400 " />
    </div>
  );
};

export default function Boards() {
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserStore();
  const { open: openRenameDialog, setOpen: setOpenRenameDialog } = useDialog();
  const {
    open: openCreateNewBoardDialog,
    setOpen: setOpenCreateNewBoardDialog,
  } = useDialog();
  const [newName, setNewName] = useState("");
  const [renameBoardId, setRenameBoardId] = useState("");
  const [name, setName] = useState("");

  const fetchBoards = useCallback(() => {
    setIsLoading(true);
    const q = query(
      collection(db, "boards"),
      where("userId", "==", user?.uid || ""),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(q, (boardsSnapshot) => {
      const boardsData = boardsSnapshot.docs.map(
        (board) =>
          ({
            ...board.data(),
            id: board.id,
          }) as Board,
      );
      setBoards(boardsData);
      setIsLoading(false);
    });
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = fetchBoards();
      return () => unsubscribe();
    }
  }, [user?.uid, fetchBoards]);

  const createNewBoard = useMutation({
    onError: () => {
      console.log("Failed to create new board");
    },
    mutationFn: async ({ name }: { name: string }) => {
      if (!user?.uid) return;
      return await addDoc(collection(db, "boards"), {
        nodes: [],
        edges: [],
        notes: "",
        name: name,
        userId: user.uid,
        userName: user.name || "myUserName",
        createdAt: Timestamp.now(),
      });
    },
  });

  const renameBoard = useMutation({
    mutationFn: async ({
      boardId,
      name,
    }: {
      boardId: string;
      name: string;
    }) => {
      return await updateDoc(doc(db, "boards", boardId), {
        name,
      });
    },
    onError: (e) => {
      toast({
        title: "Failed to rename board",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-col max-w-xl mx-auto pt-12 lg:pt-12 items-center">
      <FolderPlus className="w-8 h-8 text-gray-400 mx-auto" />
      <Button
        onClick={() => setOpenCreateNewBoardDialog(true)}
        className="border mt-2 text-white font-normal capitalize flex items-center gap-1"
      >
        <div className="w-6 h-6">
          {createNewBoard.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Plus />
          )}
        </div>
        New Board
      </Button>
      <div className="flex flex-col gap-4 mt-4 w-full">
        {isLoading &&
          new Array(5).fill(0).map((i) => <BoardSkeleton key={i} />)}
        {boards &&
          !isLoading &&
          boards?.map((board) => <BoardItem 
            board={board}
             setNewName={setNewName}
             setOpenRenameDialog={setOpenRenameDialog}
             setRenameBoardId={setRenameBoardId}
             key={board.id}
            />)}
      </div>
      <DialogForm
        title="Rename Board"
        open={openRenameDialog}
        setOpen={setOpenRenameDialog}
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        actionText="Rename"
        isLoading={renameBoard.isPending}
        actionHandler={async () => {
          await renameBoard.mutateAsync({
            boardId: renameBoardId,
            name: newName,
          });
          setOpenRenameDialog(false);
        }}
      />
      <DialogForm
        title="Create New Board"
        open={openCreateNewBoardDialog}
        setOpen={setOpenCreateNewBoardDialog}
        value={name}
        onChange={(e) => setName(e.target.value)}
        actionText="Create"
        isLoading={createNewBoard.isPending}
        actionHandler={async () => {
          await createNewBoard.mutateAsync({
            name: name,
          });
          setOpenCreateNewBoardDialog(false);
        }}
      />
    </div>
  );
}
