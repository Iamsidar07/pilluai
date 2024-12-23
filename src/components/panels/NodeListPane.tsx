import { Panel } from "@xyflow/react";
import AddImageNode from "../AddImageNode";
import AddChatNode from "../AddChatNode";
import AddTextNode from "../AddTextNode";
import AddYoutubeNode from "../AddYoutubeNode";
import AddWebScrapperNode from "../AddWebScrapperNode";
import AddPdfNode from "../AddPdfNode";
import { useMemo } from "react";

const NodeListPane = () => {
  const nodeListWithMemo = useMemo(
    () => (
      <div>
        <Panel
          position="bottom-left"
          className="!z-10 !bottom-1/2 translate-y-1/2 bg-white shadow-2xl border !rounded-lg flex flex-col items-center justify-center w-fit"
        >
          <AddPdfNode />
          <AddImageNode />
          <AddYoutubeNode />
          <AddTextNode />
          <AddChatNode />
          <AddWebScrapperNode />
        </Panel>
      </div>
    ),
    [],
  );
  return nodeListWithMemo;
};

export default NodeListPane;
