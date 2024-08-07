"use client";
import { db } from "@/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { Board } from "../../typing";
import BoardsLoading from "./BoardsLoading";
import BoardItem from "./BoardItem";
import { useAuth } from "@clerk/nextjs";

const Boards = () => {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<Board[] | null>(null);
  const fetchBoards = useCallback(() => {
    setIsLoading(true);
    const q = query(
      collection(db, `users/${userId}/boards`),
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
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const unsubscribe = fetchBoards();
      return () => unsubscribe();
    }
  }, [userId, fetchBoards]);

  return (
    <div className="mt-4 w-full flex flex-col gap-4">
      {isLoading && <BoardsLoading />}
      {boards?.map((board) => <BoardItem key={board.id} board={board} />)}
    </div>
  );
};

export default Boards;
