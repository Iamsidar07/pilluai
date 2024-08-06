import type { BuiltInNode, Node, NodeTypes } from "@xyflow/react";
import ChatNode from "./ChatNode";
import ImageNode from "./ImageNode";
import PdfNode from "./PdfNode";
import TextNode from "./TextNode";
import WebScrapperNode from "./WebScrapperNode";
import YoutubeNode from "./YoutubeNode";

export type TTextNode = Node<
  {
    text: string;
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
  },
  "pdfNode"
>;

export type TChatNode = Node<
  {
    text: string;
    type: "chatNode";
  },
  "chatNode"
>;
export type TWebScrapperNode = Node<
  {
    url: string;
    description: string;
    screenshotUrl: string;
    type: "webScrapperNode";
    userEmail: string;
    userName: string;
    title: string;
    namespace: string;
    text: string;
  },
  "webScrapperNode"
>;
export type TImageNode = Node<
  {
    description: string;
    tempUrl: string;
    text: string;
    title: string;
    url: string;
    type: "imageNode";
  },
  "imageNode"
>;
export type TYoutubeNode = Node<
  {
    description: string;
    title: string;
    url: string;
    type: "youtubeNode";
    namespace: string;
    text: string;
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
