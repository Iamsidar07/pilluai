"use client";
import { db } from "@/firebase";
import { useMutation } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import React, { useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import { Board } from "../../typing";
import DeleteBoard from "./DeleteBoard";
import RenameBoard from "./RenameBoard";

interface BoardItemProps {
  board: Board;
}
const BoardItem = ({ board }: BoardItemProps) => {
  const deleteBoard = useMutation({
    onError: (e) => {
      toast.error("Failed to delete Board");
    },
    mutationFn: async (boardId: string) =>
      deleteDoc(doc(db, "boards", boardId)),
  });

  const handleDeleteBoard = useCallback(
    (boardId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteBoard.mutate(boardId);
    },
    [deleteBoard]
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
        <DropdownMenuContent className="text-gray-400 flex flex-col gap-1">
          <DropdownMenuItem asChild className="w-full">
            <DeleteBoard boardId={board.id} />
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="w-full">
            <RenameBoard name={board.name} boardId={board.id} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BoardItem;
