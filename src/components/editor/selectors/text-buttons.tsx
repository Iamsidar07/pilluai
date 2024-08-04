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
import { Button } from "@/components/ui/button";

// @ts-ignore
export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;
  const items: SelectorItem[] = [
    {
      name: "bold",
      // @ts-ignore
      isActive: (editor: EditorInstance) => editor.isActive("bold"),
      // @ts-ignore
      command: (editor: EditorInstance) =>
        editor.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      // @ts-ignore
      isActive: (editor: EditorInstance) => editor.isActive("italic"),
      // @ts-ignore
      command: (editor: EditorInstance) =>
        editor.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      // @ts-ignore
      isActive: (editor: EditorInstance) => editor.isActive("underline"),
      // @ts-ignore
      command: (editor: EditorInstance) =>
        editor.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      // @ts-ignore
      isActive: (editor: EditorInstance) => editor.isActive("strike"),
      // @ts-ignore
      command: (editor: EditorInstance) =>
        editor.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: "code",
      // @ts-ignore
      isActive: (editor: EditorInstance) => editor.isActive("code"),
      // @ts-ignore
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
                "text-primary": item.isActive(editor),
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};
