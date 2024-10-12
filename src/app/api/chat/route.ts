import { AppNode } from "@/components/nodes";
import { adminDb } from "@/firebaseAdmin";
import {
  embeddings,
  getLoader,
  index,
  isNamespaceExists,
} from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatMistralAI } from "@langchain/mistralai";
import {
  createStreamDataTransformer,
  Message,
  StreamingTextResponse,
} from "ai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Document } from "langchain/document";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { Chat } from "../../../../typing";

type RequestBody = {
  messages: Message[];
  boardId: string;
  nodeId: string;
  currentChat: Chat | null;
  knowledgeBase: AppNode[];
};

export const runtime = "nodejs";

const customTemplate = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Keep the answer as concise as possible.
Always say "thanks for asking!" at the end of the answer. Use emojis whenever needed.

{context}

Question: {question}

Helpful Answer:`;

const vectorStoreCache: Record<string, UpstashVectorStore> = {};

const llm = new ChatMistralAI({
  model: "mistral-large-latest",
  temperature: 0,
  maxTokens: 1000,
});

const addMessageToDB = async (
  userId: string,
  boardId: string,
  nodeId: string,
  currentChatId: string,
  role: "user" | "assistant",
  content: string,
) =>
  adminDb
    .collection("users")
    .doc(userId)
    .collection("boards")
    .doc(boardId)
    .collection("chatNodes")
    .doc(nodeId)
    .collection("chats")
    .doc(currentChatId)
    .collection("messages")
    .add({
      id: nanoid(),
      role,
      content,
      createdAt: new Date(),
    });

export const POST = async (req: NextRequest) => {
  try {
    const requestBody = (await req.json()) as RequestBody;
    const { userId } = auth();
    const { messages, knowledgeBase, boardId, nodeId, currentChat } =
      requestBody;
    if (!userId) {
      return NextResponse.json(
        { message: "You are not authorized to access this route" },
        { status: 401 },
      );
    }
    const question = messages[messages?.length - 1].content;
    let rawContext = "";
    let firstKbWithNamespace: AppNode | undefined;
    knowledgeBase?.map((kb) => {
      // @ts-ignore
      if (kb?.data.namespace && !firstKbWithNamespace) {
        firstKbWithNamespace = kb;
      } else {
        // @ts-ignore
        rawContext += `${kb.data?.metadata && `metadata: ${kb.data.metadata}`} \n\n context: ${kb.data?.text} \n\n`;
      }
    });
    const constructedMessages = messages.map((message) =>
      message.role === "user"
        ? new HumanMessage(message.content)
        : new AIMessage(message.content),
    );
    const customRagPrompt = PromptTemplate.fromTemplate(customTemplate);

    const customRagChain = await createStuffDocumentsChain({
      llm: llm,
      prompt: customRagPrompt,
      outputParser: new HttpResponseOutputParser(),
    });
    await addMessageToDB(
      userId,
      boardId,
      nodeId,
      currentChat?.id as string,
      "user",
      question,
    );

    // @ts-ignore
    if (!firstKbWithNamespace || !firstKbWithNamespace?.data?.namespace) {
      const stream = await customRagChain.stream({
        question,
        context: [new Document({ pageContent: rawContext })],
        history: constructedMessages,
      });
      return new StreamingTextResponse(
        stream.pipeThrough(createStreamDataTransformer()),
      );
    }

    let vectorStore: UpstashVectorStore;
    // @ts-ignore
    const namespace = firstKbWithNamespace?.data.namespace;
    if (await isNamespaceExists(namespace, index)) {
      if (!vectorStoreCache[namespace]) {
        vectorStoreCache[namespace] =
          await UpstashVectorStore.fromExistingIndex(embeddings, {
            index,
            namespace,
          });
        vectorStore = vectorStoreCache[namespace];
      }
      vectorStore = vectorStoreCache[namespace];
    } else {
      const loader = await getLoader({
        // @ts-ignore
        url: firstKbWithNamespace.data.url,
        // @ts-ignore
        type: firstKbWithNamespace.data.type,
      });
      const docs = await loader.load();
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 200,
        chunkSize: 1000,
      });
      const splits = await textSplitter.splitDocuments(docs);
      vectorStore = new UpstashVectorStore(embeddings, {
        namespace,
        index,
      });
      await vectorStore.addDocuments(splits);
    }
    const retriever = vectorStore.asRetriever();

    const context = await retriever.invoke(question);
    const stream = await customRagChain.stream({
      question,
      context: [...context, new Document({ pageContent: rawContext })],
      history: constructedMessages,
    });
    return new StreamingTextResponse(
      stream.pipeThrough(createStreamDataTransformer()),
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
