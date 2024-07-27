"use client";

import { db } from "@/firebase";
import { debounce } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  EditorBubble,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  JSONContent,
} from "novel";
import {
  handleCommandNavigation,
  Placeholder,
  StarterKit,
} from "novel/extensions";
import { useCallback, useState, useEffect, useMemo } from "react";
import { slashCommand, suggestionItems } from "./commands";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { NodeSelector } from "./selectors/node-selector";
import { TextButtons } from "./selectors/text-buttons";
import { defaultExtensions } from "./extensions";

const getBoard = async (boardId: string) => {
  const docRef = doc(db, "boards", boardId);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
};

const TailwindEditor = ({
  initialContent,
  boardId,
  setSaveStatus,
}: {
  boardId: string;
  initialContent: JSONContent | null;
  setSaveStatus: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [content, setContent] = useState<JSONContent>({
    type: "doc",
    content: [],
  });

  const {
    data: boardData,
    isLoading,
    error: errorWhileFetchingNotes,
  } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoard(boardId),
  });

  useEffect(() => {
    if (boardData && boardData.notes) {
    }
  }, [boardData, boardData?.notes]);

  const extensions = useMemo(() => [...defaultExtensions, slashCommand], []);

  console.log("content", content);
  const onUpdate = async (content: JSONContent) => {
    try {
      setSaveStatus("Saving...");
      const docRef = doc(db, "boards", boardId);
      const docSnap = await updateDoc(docRef, {
        notes: JSON.stringify(content),
      });
      console.log("Updated doc:", docSnap);
    } catch (e) {
      console.log(e);
      console.log("Failed to update doc");
      setSaveStatus("Failed");
    } finally {
      console.log("Saving done");
      setSaveStatus("Save");
    }
  };

  const { mutateAsync: updateNotes, error } = useMutation({
    mutationFn: ({ content }: { content: JSONContent }) => onUpdate(content),
  });

  const debouncedUpdateNotes = useCallback(
    (content: JSONContent) => debounce(() => updateNotes({ content }), 500),
    [updateNotes]
  );
  return (
    <EditorRoot>
      <EditorContent
        extensions={extensions}
        initialContent={initialContent ?? { type: "doc", content: [] }}
        className=""
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          attributes: {
            class: `prose dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full h-full `,
          },
        }}
        onUpdate={({ editor }) => {
          setContent(editor.getJSON());
          debouncedUpdateNotes(editor.getJSON());
        }}
      >
        <EditorCommand className="z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">
            No results
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command && item.command(val)}
                className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
        <EditorBubble
          tippyOptions={{
            placement: false ? "bottom-start" : "top",
          }}
          className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl"
        >
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          <LinkSelector open={openLink} onOpenChange={setOpenLink} />
          <TextButtons />
          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
};
export default TailwindEditor;
