"use client";
import createNewBoard from "@/actions/createNewBoard";
import useCurrentUser from "@/context/currentUser";
import { FolderPlus, Loader2, Plus } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

const CreateBoard = () => {
  const { user } = useCurrentUser();
  const [isPending, startTransition] = useTransition();
  const [boardName, setBoardName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!boardName || !user) return;
    startTransition(async () => {
      const { success, message } = await createNewBoard(boardName, user);
      if (success) {
        toast.success("Successfully create new board.");
        setIsOpen(false);
      } else {
        toast.error(message ? message : "Failed to create new board");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <FolderPlus className="w-8 h-8 text-gray-400 mx-auto" />

      <DialogTrigger asChild>
        <Button className="border mt-2 text-white capitalize flex items-center gap-1 font-bold">
          <>
            <div className="w-6 h-6">
              {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            </div>
            New Board
          </>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="w-full"
          />
          <Button
            disabled={isPending || !boardName}
            type="submit"
            className="mt-4 w-full"
          >
            {isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoard;
