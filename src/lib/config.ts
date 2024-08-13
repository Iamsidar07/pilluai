const maxFreeBoards = 2;
const maxFreeMessage = 3;
const maxFreeChatInOneChatNode = 2;
const maxProBoards = 20;
const maxProMessage = 100;
const maxProChatInOneChatNode = 7;
const freePdfSize = 4; // in mb
const proPdfSize = 16; // in mb
const NODE_LIMITS = {
  pdfNode: { free: 1, active: 7 },
  imageNode: { free: 2, active: 15 },
  webScrapperNode: { free: 1, active: 7 },
  youtubeNode: { free: 1, active: 7 },
  chatNode: { free: 1, active: 5 },
  textNode: { free: 10000, active: 5000 },
};
export {
  freePdfSize,
  proPdfSize,
  maxProBoards,
  maxProMessage,
  maxProChatInOneChatNode,
  maxFreeBoards,
  maxFreeMessage,
  maxFreeChatInOneChatNode as maxChatInOneChatNode,
  NODE_LIMITS,
};
