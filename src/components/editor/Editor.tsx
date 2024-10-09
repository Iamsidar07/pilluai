"use client";
import "@/styles/novel.css";
import { db } from "@/firebase";
import { debounce } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
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
import { handleCommandNavigation } from "novel/extensions";
import { useState, useMemo, useCallback } from "react";
import { slashCommand, suggestionItems } from "./commands";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { NodeSelector } from "./selectors/node-selector";
import { TextButtons } from "./selectors/text-buttons";
import { defaultExtensions } from "./extensions";
import { useAuth } from "@clerk/nextjs";

const getBoard = async (userId: string, boardId: string) => {
  const docRef = doc(db, `users/${userId}/boards`, boardId);
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
  const { userId } = useAuth();
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);

  const extensions = useMemo(() => [...defaultExtensions, slashCommand], []);

  const onUpdate = useCallback(
    async (content: JSONContent) => {
      if (!userId) return;
      try {
        setSaveStatus("Saving...");
        const docRef = doc(db, `users/${userId}/boards`, boardId);
        await updateDoc(docRef, {
          notes: JSON.stringify(content),
        });
      } catch (e) {
        console.log(e);
        setSaveStatus("Failed");
      } finally {
        setSaveStatus("Save");
      }
    },
    [boardId, setSaveStatus, userId],
  );

  const onUpdateDebounced = useMemo(() => {
    return debounce((json: JSONContent) => {
      onUpdate(json);
    }, 400);
  }, [onUpdate]);

  const handleUpdate = useCallback(() => {
    return (editor: any) => {
      onUpdateDebounced(editor.getJSON());
    };
  }, [onUpdateDebounced]);

  return (
    <EditorRoot>
      <EditorContent
        extensions={extensions}
        initialContent={initialContent ?? { type: "doc", content: [] }}
        className="px-2 py-4"
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          attributes: {
            class: `prose-sm prose-headings:font-title focus:outline-none max-w-full h-full`,
          },
        }}
        onUpdate={({ editor }) => {
          handleUpdate()(editor);
        }}
      >
        <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">
            No results
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command && item.command(val)}
                className={`flex w-full items-center space-x-1 rounded-md px-2 py-1 text-left text-xs hover:bg-accent aria-selected:bg-accent`}
                key={item.title}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md border border-muted bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-normal">{item.title}</p>
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
          className="flex w-fit max-w-[80vw] overflow-hidden rounded border border-muted bg-background shadow-xl"
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
