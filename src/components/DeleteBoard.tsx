"use client";
import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Archive, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import useSubscription from "@/hooks/useSubscription";
import { useAuth } from "@clerk/nextjs";

interface Props {
  boardId: string;
}

const DeleteBoard = ({ boardId }: Props) => {
  const { userId } = useAuth();
  const { hasActiveMembership } = useSubscription();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const handleDeleteBoard = () => {
    if (!userId) {
      toast.info("Please login to continue.");
      return;
    }
    if (!boardId || !hasActiveMembership) return;
    startTransition(async () => {
      try {
        await deleteDoc(doc(db, `users/${userId}/boards/${boardId}`));
        setIsOpen(false);
        toast.success("Successfully deleted the board.");
      } catch (error) {
        toast.error("Failed to delete board.");
      }
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        disabled={!hasActiveMembership}
        className="w-full"
        variant="outline"
      >
        <DialogTrigger asChild>
          <div className="flex items-center gap-1">
            {hasActiveMembership ? (
              <Archive className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Archive
          </div>
        </DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure to delete board?</DialogTitle>
          <DialogDescription>
            This will delete this board permanently.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 ml-auto">
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={isPending}
            onClick={handleDeleteBoard}
            variant="destructive"
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBoard;
