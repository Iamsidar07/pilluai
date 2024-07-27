"use client";
import React, { FormEvent, useEffect, useState, useTransition } from "react";
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
import { isValidYoutubeUrl } from "@/lib/utils";
import { toast } from "sonner";
import { TYoutubeNode } from "./nodes";
import { nanoid } from "nanoid";
import getYoutubeVideoInfo from "@/actions/getYoutubeVideoInfo";
import { usePanel } from "@/context/panel";
import getVideoTranscription from "@/actions/getVideoTranscription";

const AddYoutubeNode = () => {
  const { addNode, updateNode } = usePanel();
  const isYPressed = useKeyPress("y" || "Y");
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isYPressed) {
    }
  }, [isYPressed]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidYoutubeUrl(videoUrl)) {
      toast.error("Invalid video url.");
      return;
    }
    startTransition(async () => {
      const { success, description, title } = await getYoutubeVideoInfo(
        videoUrl
      );
      if (!success) {
        toast.error("Failed to get video details");
        return;
      }
      const node: TYoutubeNode = {
        id: nanoid(),
        position: { x: 0, y: 0 },
        type: "youtubeNode",
        data: {
          url: videoUrl,
          type: "youtubeNode",
          namespace: "",
          text: "",
          title: title || "",
          description: description || "",
        },
      };
      addNode(node);
      setOpen(false);
      const { success: isTranscriptionSuccess, text } =
        await getVideoTranscription(videoUrl);
      if (!isTranscriptionSuccess) {
        toast.error("Failed to get transcription.");
      }
      const res = await fetch("/api/yt/index", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: videoUrl,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to index video.");
        return;
      }
      const { namespace } = await res.json();
      updateNode({
        id: node.id,
        type: "youtubeNode",
        data: {
          namespace,
          text,
        },
      });
    });
  };

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
          <Button type="submit" className="mt-6">
            {isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddYoutubeNode;
