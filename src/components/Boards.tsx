"use client";
import { db } from "@/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { Board } from "../../typing";
import BoardsLoading from "./BoardsLoading";
import BoardItem from "./BoardItem";
import useCurrentUser from "@/context/currentUser";

const Boards = () => {
  const { user } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<Board[] | null>(null);
  const fetchBoards = useCallback(() => {
    setIsLoading(true);
    const q = query(
      collection(db, `users/${user?.uid}/boards`),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (boardsSnapshot) => {
      const boardsData = boardsSnapshot.docs.map(
        (board) =>
          ({
            ...board.data(),
            id: board.id,
          } as Board)
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

  return (
    <div className="mt-4 w-full flex flex-col gap-4">
      {isLoading && <BoardsLoading />}
      {boards?.map((board) => (
        <BoardItem key={board.id} board={board} />
      ))}
    </div>
  );
};

export default Boards;
