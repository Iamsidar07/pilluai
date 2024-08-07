"use client";
import React, { useEffect } from "react";
import PanelItem from "./panels/PanelItem";
import { useKeyPress } from "@xyflow/react";
import { Youtube } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import useYoutubeNode from "@/hooks/useYoutubeNode";

const AddYoutubeNode = () => {
  const { handleSubmit, videoUrl, setVideoUrl, open, setOpen, isPending } =
    useYoutubeNode();
  const isYPressed = useKeyPress("y" || "Y");
  useEffect(() => {
    if (isYPressed) {
      setOpen(true);
    }
  }, [isYPressed, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PanelItem text="Youtube" shortcutKey="Y">
        <DialogTrigger asChild>
          <Youtube />
        </DialogTrigger>
      </PanelItem>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add youtube video URL</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full"
            placeholder="Enter any youtube video URL"
          />
          <Button disabled={isPending} type="submit" className="mt-6 w-full">
            {isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddYoutubeNode;
