"use client";
import React, { FormEvent, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Pencil, Sparkles } from "lucide-react";
import useCurrentUser from "@/context/currentUser";
import renameBoard from "@/actions/renameBoard";
import { toast } from "sonner";
import useSubscription from "@/hooks/useSubscription";

interface Props {
  name: string;
  boardId: string;
}

const RenameBoard = ({ name, boardId }: Props) => {
  const { user } = useCurrentUser();
  const { hasUserProPlanSubscribe } = useSubscription();
  const [newBoardName, setNewBoardName] = useState(name ?? "");
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.uid) {
      toast.info("Please login to continue.");
      return;
    }
    if (!newBoardName || !boardId || !hasUserProPlanSubscribe) return;
    startTransition(async () => {
      const { success } = await renameBoard(newBoardName, boardId, user?.uid);
      if (success) {
        toast.success("Successfully renamed board.");
        setIsOpen(false);
      } else {
        toast.error("Failed to rename");
      }
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        disabled={!hasUserProPlanSubscribe}
        className="w-full"
        variant="outline"
      >
        <DialogTrigger asChild>
          <div className="flex items-center gap-1">
            {hasUserProPlanSubscribe ? (
              <Pencil className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Rename
          </div>
        </DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            className="w-full"
          />
          <Button
            disabled={isPending || !newBoardName}
            type="submit"
            className="mt-4 w-full"
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameBoard;
