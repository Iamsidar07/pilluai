import remarkGfm from "remark-gfm";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import React from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import Link from "next/link";
import { nanoid } from "nanoid";

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <Markdown
      className={"prose-sm"}
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          console.log("match", match);
          return match ? (
            // @ts-ignore
            <SyntaxHighlighter
              {...rest}
              PreTag="div"
              language={match[1]}
              style={vscDarkPlus}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              {...rest}
              className={"border font-mono w-full px-1 py-0.5 bg-zinc-100"}
            >
              {children}
            </code>
          );
        },
        a(props) {
          const { href } = props;
          return (
            <Link
              href={href!}
              className="text-sm text-violet-500"
              target="_blank"
            >
              {href}
            </Link>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
};

export default MarkdownRenderer;
