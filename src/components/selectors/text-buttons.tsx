import { cn } from "@/lib/utils";
import { EditorBubbleItem, EditorInstance, useEditor } from "novel";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
} from "lucide-react";
import type { SelectorItem } from "./node-selector";
import { Button } from "../ui/button";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;
  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (editor: EditorInstance) => editor.isActive("bold"),
      command: (editor: EditorInstance) =>
        editor.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: (editor: EditorInstance) => editor.isActive("italic"),
      command: (editor: EditorInstance) =>
        editor.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: (editor: EditorInstance) => editor.isActive("underline"),
      command: (editor: EditorInstance) =>
        editor.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      isActive: (editor: EditorInstance) => editor.isActive("strike"),
      command: (editor: EditorInstance) =>
        editor.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: "code",
      isActive: (editor: EditorInstance) => editor.isActive("code"),
      command: (editor: EditorInstance) =>
        editor.chain().focus().toggleCode().run(),
      icon: CodeIcon,
    },
  ];
  return (
    <div className="flex">
      {items.map((item, index) => (
        <EditorBubbleItem
          key={index}
          onSelect={(editor) => {
            item.command(editor);
          }}
        >
          <Button size="icon" className="rounded-none" variant="ghost">
            <item.icon
              className={cn("h-4 w-4", {
                "text-blue-500": item.isActive(editor),
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};
