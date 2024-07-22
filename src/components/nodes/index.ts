import type { BuiltInNode, Node, NodeTypes } from "@xyflow/react";
import ChatNode from "./chatNode/ChatNode";
import ImageNode from "./ImageNode";
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
    tempUrl: string; //TODO: base64 of image
    text: string;
    title: string;
    url: string; //TODO: Uploaded url
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
  | TTextNode;

export const initialNodes: AppNode[] = [];

export const nodeTypes = {
  textNode: TextNode,
  chatNode: ChatNode,
  webScrapperNode: WebScrapperNode,
  imageNode: ImageNode,
  youtubeNode: YoutubeNode,
} satisfies NodeTypes;
