"use client";
import { Board } from "@/app/boards/page";
import { db } from "@/firebase";
import { useMutation } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import { Archive, EllipsisVertical, Pencil } from "lucide-react";
import Link from "next/link";
import React, { useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "./ui/use-toast";

interface BoardItemProps {
  board: Board;
  setNewName: React.Dispatch<React.SetStateAction<string>>;
  setRenameBoardId: React.Dispatch<React.SetStateAction<string>>;
  setOpenRenameDialog: React.Dispatch<React.SetStateAction<boolean>>;
}
const BoardItem = ({
  board,
  setNewName,
  setRenameBoardId,
  setOpenRenameDialog,
}: BoardItemProps) => {
  const { toast } = useToast();

  const deleteBoard = useMutation({
    onError: (e) => {
      toast({
        title: "Failed to delete Board",
        description: e.message,
        variant: "destructive",
      });
    },
    mutationFn: async (boardId: string) =>
      deleteDoc(doc(db, "boards", boardId)),
  });

  const handleDeleteBoard = useCallback(
    (boardId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteBoard.mutate(boardId);
    },
    [deleteBoard],
  );

  return (
    <div
      key={board.id}
      className="p-4 border w-full flex items-center justify-between rounded-lg cursor-pointer"
    >
      <Link href={`/boards/${board.id}`}>
        <p className="font-bold">{board.name}</p>
        <p className="text-gray-400 mt-2">
          Date: {board.createdAt.toDate().toLocaleString()}
        </p>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical className="w-6 h-6 text-gray-400 cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="text-gray-400">
          <DropdownMenuItem
            onClick={(e) => handleDeleteBoard(board.id as string, e)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <p>Archive</p>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setNewName(board.name as string);
              setRenameBoardId(board.id as string);
              setOpenRenameDialog(true);
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            <p>Rename</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BoardItem;
