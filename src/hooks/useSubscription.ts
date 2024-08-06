"use client";

import useCurrentUser from "@/context/currentUser";
import { db } from "@/firebase";
import { maxFreeBoards, maxProBoards } from "@/lib/config";
import { collection, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";

function useSubscription() {
  const { user } = useCurrentUser();
  const [hasActiveMembership, setHasActiveMembership] = useState(null);
  const [isOverBoardLimit, setIsOverBoardLimit] = useState(false);

  const [snapshot, loading, error] = useDocument(
    user && doc(db, "users", user.uid),
    {
      snapshotListenOptions: {
        includeMetadataChanges: true,
      },
    },
  );

  const [boardsSnapshot, boardsSnapshotLoading, boardsSnapshotError] =
    useCollection(user && collection(db, "users", user.uid, "boards"));

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

  const hasUserProPlanSubscribe = true;
  return {
    hasUserProPlanSubscribe,
    isOverBoardLimit,
    hasActiveMembership,
    loading,
    error,
    boardsSnapshotLoading,
    boardsSnapshotError,
  };
}
export default useSubscription;
