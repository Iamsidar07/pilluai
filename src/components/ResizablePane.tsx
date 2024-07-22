"use client";
import { ChevronRight, File, GripVertical } from "lucide-react";
import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Notes from "./Notes";
import NodeListPane from "./panels/NodeListPane";
const ResizablePane = () => {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <PanelGroup autoSaveId="Pane" direction="horizontal">
      <Panel defaultSize={30}>
        <div className="h-full w-full bg-transparent z-20">
          <NodeListPane />
        </div>
      </Panel>
      {showNotes && (
        <div
          onClick={() => setShowNotes(false)}
          className="w-10 z-50 h-10 mt-2 mr-2 p-2 border rounded-full bg-white flex items-center justify-center cursor-pointer group nodrag"
        >
          <ChevronRight className="text-gray-500 w-5 h-5  group-hover:text-gray-600 " />
        </div>
      )}
      {showNotes && (
        <PanelResizeHandle className="w-px h-full flex items-center justify-center flex-col bg-transparent">
          <GripVertical className="text-gray-500 w-6 h-6 group-hover:text-gray-600 ml-1 z-[9999]" />
        </PanelResizeHandle>
      )}
      <Panel minSize={25} defaultSize={30}>
        {showNotes ? (
          <div className="h-full w-full z-50 nodrag bg-red-800 relative">
            <Notes />
          </div>
        ) : null}
      </Panel>
      {!showNotes && (
        <div
          onClick={() => {
            setShowNotes(true);
            console.log("c");
          }}
          className="z-10 p-2 w-10 h-10 m-2 bg-white rounded-full flex items-center justify-center cursor-pointer group nodrag"
        >
          <File className="text-gray-500 w-6 h-6 group-hover:text-gray-600 " />
        </div>
      )}
    </PanelGroup>
  );
};

export default ResizablePane;
