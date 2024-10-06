import type { BuiltInNode, Node, NodeTypes } from "@xyflow/react";
// import ChatNode from "./ChatNode";
import ChatNode from "../chat";
import ImageNode from "./ImageNode";
import PdfNode from "./PdfNode";
import TextNode from "./TextNode";
import WebScrapperNode from "./WebScrapperNode";
import YoutubeNode from "./YoutubeNode";

export type TTextNode = Node<
  {
    text: string;
    metadata: string;
    type: "textNode";
  },
  "textNode"
>;

export type TPdfNode = Node<
  {
    url: string;
    type: "pdfNode";
    name: string;
    namespace: string;
    metadata: string;
  },
  "pdfNode"
>;

export type TChatNode = Node<
  {
    type: "chatNode";
  },
  "chatNode"
>;
export type TWebScrapperNode = Node<
  {
    url: string;
    screenshotUrl: string;
    type: "webScrapperNode";
    title: string;
    metadata: string;
    text: string;
    namespace?: string;
  },
  "webScrapperNode"
>;
export type TImageNode = Node<
  {
    tempUrl: string;
    title: string;
    url: string;
    base64: string;
    metadata: string;
    text: string;
    type: "imageNode";
  },
  "imageNode"
>;
export type TYoutubeNode = Node<
  {
    title: string;
    url: string;
    type: "youtubeNode";
    namespace: string;
    text: string;
    metadata: string;
  },
  "youtubeNode"
>;
export type AppNode =
  | TImageNode
  | TWebScrapperNode
  | TChatNode
  | BuiltInNode
  | TYoutubeNode
  | TTextNode
  | TPdfNode;

export const initialNodes: AppNode[] = [];

export const nodeTypes = {
  textNode: TextNode,
  chatNode: ChatNode,
  webScrapperNode: WebScrapperNode,
  imageNode: ImageNode,
  youtubeNode: YoutubeNode,
  pdfNode: PdfNode,
} satisfies NodeTypes;
