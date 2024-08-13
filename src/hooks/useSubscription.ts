"use client";

import { db } from "@/firebase";
import { maxFreeBoards, maxProBoards } from "@/lib/config";
import { useUser } from "@clerk/nextjs";
import { collection, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";

function useSubscription() {
  const { user } = useUser();
  const [hasActiveMembership, setHasActiveMembership] = useState(null);
  const [isOverBoardLimit, setIsOverBoardLimit] = useState(false);

  const [snapshot, loading, error] = useDocument(
    user && doc(db, "users", user.id),
    {
      snapshotListenOptions: {
        includeMetadataChanges: true,
      },
    },
  );

  const [boardsSnapshot, boardsSnapshotLoading, boardsSnapshotError] =
    useCollection(user && collection(db, "users", user.id, "boards"));

  useEffect(() => {
    if (!snapshot) return;
    const data = snapshot.data();
    if (!data) return;
    setHasActiveMembership(data.hasActiveMembership);
  }, [snapshot]);

  useEffect(() => {
    if (!boardsSnapshot || !hasActiveMembership === null) return;
    const boards = boardsSnapshot.docs;
    const userLimit = hasActiveMembership ? maxProBoards : maxFreeBoards;
    setIsOverBoardLimit(boards.length >= userLimit);
  }, [boardsSnapshot, hasActiveMembership]);

  return {
    isOverBoardLimit,
    hasActiveMembership,
    loading,
    error,
    boardsSnapshotLoading,
    boardsSnapshotError,
  };
}
export default useSubscription;
