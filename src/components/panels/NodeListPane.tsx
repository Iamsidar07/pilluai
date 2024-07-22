"use client";
import { Panel } from "@xyflow/react";
import { Bot, Globe, Image as ImageIcon, Type, Youtube } from "lucide-react";
import { useRef, useState } from "react";
import DialogForm from "../DialogForm";
import { useToast } from "../ui/use-toast";
import useAddImageNode from "./AddImageNode";
import PanelItem from "./PanelItem";
import useAddNode from "./useAddNode";
import useAddYoutubeNode from "./useAddYoutubeNode";
import useCommandKey from "./useCommandKey";

const NodeListPane = () => {
  const { toast } = useToast();
  const { addChatNode, addTextNode, addWebScrapperNode } = useAddNode();
  const { handleSelectFile } = useAddImageNode();
  const selectImageRef = useRef<HTMLLabelElement | null>(null);
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
  const { handleYoutubeVideoUrlSubmit, isYoutubeNodeLoading } =
    useAddYoutubeNode({
      youtubeVideoUrl,
    });
  const [open, setOpen] = useState(false);

  const {} = useCommandKey({
    setOpen,
    selectImageRef
  });

  const NODE_TYPES = [
    {
      text: "Image",
      icon: <ImageIcon />,
      shortcutKey: "I",
      type: "imageNode",
    },
    {
      text: "Youtube",
      icon: <Youtube />,
      shortcutKey: "Y",
      type: "youtubeNode",
      onClick: () => {
        setOpen(true);
      },
    },
    {
      text: "Text",
      icon: <Type />,
      shortcutKey: "T",
      type: "textNode",
      onClick: addTextNode,
    },
    {
      text: "Chat",
      icon: <Bot />,
      shortcutKey: "C",
      type: "chatNode",
      onClick: addChatNode,
    },
    {
      text: "Website",
      icon: <Globe />,
      shortcutKey: "W",
      type: "webScrapperNode",
      onClick: addWebScrapperNode,
    },
  ];

  return (
    <div>
      <DialogForm
        title="Youtube Video URL"
        actionText="Add Video"
        value={youtubeVideoUrl}
        open={open}
        setOpen={setOpen}
        onChange={(e) => setYoutubeVideoUrl(e.target.value)}
        isLoading={isYoutubeNodeLoading}
        actionHandler={handleYoutubeVideoUrlSubmit}
      />
      <Panel
        position="bottom-left"
        className="!z-10 !bottom-1/2 translate-y-1/2 bg-white shadow-sm !rounded-lg flex flex-col items-center justify-center w-fit"
      >
        {NODE_TYPES.map((panel, i) => (
          <PanelItem
            {...panel}
            index={i}
            key={i}
            handleSelectFile={handleSelectFile}
            ref={selectImageRef}
          />
        ))}
      </Panel>
    </div>
  );
};

export default NodeListPane;
