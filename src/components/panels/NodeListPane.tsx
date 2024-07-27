"use client";
import { Panel } from "@xyflow/react";
import AddImageNode from "../AddImageNode";
import AddChatNode from "../AddChatNode";
import AddTextNode from "../AddTextNode";
import AddYoutubeNode from "../AddYoutubeNode";
import AddWebScrapperNode from "../AddWebScrapperNode";

const NodeListPane = () => {
  return (
    <div>
      <Panel
        position="bottom-left"
        className="!z-10 !bottom-1/2 translate-y-1/2 bg-white shadow-sm !rounded-lg flex flex-col items-center justify-center w-fit"
      >
        <AddImageNode />
        <AddYoutubeNode />
        <AddTextNode />
        <AddChatNode />
        <AddWebScrapperNode />
      </Panel>
    </div>
  );
};

export default NodeListPane;
