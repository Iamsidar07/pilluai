import { AppNode } from "@/components/nodes";
import { adminDb } from "@/firebaseAdmin";
import {
  embeddings,
  getLoader,
  index,
  isNamespaceExists,
  LoaderType,
} from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
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
import { Chat, Model } from "../../../../typing";

type RequestBody = {
  messages: Message[];
  boardId: string;
  nodeId: string;
  currentChat: Chat | null;
  knowledgeBase: AppNode[];
  model: Model;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const customTemplate = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Keep the answer as concise as possible.
Always say "thanks for asking!" at the end of the answer. Use emojis whenever needed.

{context}

Question: {question}

Helpful Answer:`;

const vectorStoreCache: Record<string, UpstashVectorStore> = {};

const llmConfig = {
  temperature: 0.3,
  maxTokens: 1024,
};

const getLLM = (model: Model) =>
  model.id === "google-generative-ai"
    ? new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",
        maxOutputTokens: 1024,
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        ...llmConfig,
      })
    : new ChatMistralAI({
        model: "mistral-large-latest",
        ...llmConfig,
      });

const updateChatTitle = async (
  userId: string,
  boardId: string,
  nodeId: string,
  chatId: string,
  title: string
) => {
  await adminDb
    .collection("users")
    .doc(userId)
    .collection("boards")
    .doc(boardId)
    .collection("chatNodes")
    .doc(nodeId)
    .collection("chats")
    .doc(chatId)
    .set({
      title,
      createdAt: new Date(),
    });
};

const addMessageToDB = async (
  userId: string,
  boardId: string,
  nodeId: string,
  chatId: string,
  role: "user" | "assistant",
  content: string
) => {
  await adminDb
    .collection("users")
    .doc(userId)
    .collection("boards")
    .doc(boardId)
    .collection("chatNodes")
    .doc(nodeId)
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .add({
      id: nanoid(),
      role,
      content,
      createdAt: new Date(),
    });
};

const getVectorStore = async (
  namespace: string,
  url: string,
  type: LoaderType
) => {
  if (vectorStoreCache[namespace]) return vectorStoreCache[namespace];

  let vectorStore;
  if (await isNamespaceExists(namespace, index)) {
    vectorStore = await UpstashVectorStore.fromExistingIndex(embeddings, {
      index,
      namespace,
    });
  } else {
    const [loader, textSplitter] = await Promise.all([
      getLoader({ url, type }),
      Promise.resolve(
        new RecursiveCharacterTextSplitter({
          chunkOverlap: 200,
          chunkSize: 1000,
        })
      ),
    ]);

    const docs = await loader.load();
    const splits = await textSplitter.splitDocuments(docs);
    vectorStore = new UpstashVectorStore(embeddings, { namespace, index });
    await vectorStore.addDocuments(splits);
  }
  vectorStoreCache[namespace] = vectorStore;
  return vectorStore;
};

const createContext = (knowledgeBase: AppNode[]) => {
  let rawContext = "";
  let firstKbWithNamespace: AppNode | null = null;

  knowledgeBase.forEach((kb) => {
    // @ts-ignore
    if (kb?.data.namespace && !firstKbWithNamespace) {
      firstKbWithNamespace = kb;
    } else {
      // @ts-ignore
      rawContext += `${kb.data?.metadata && `metadata: ${kb.data.metadata}`} \n\n context: ${kb.data?.text} \n\n`;
    }
  });
  return { rawContext, firstKbWithNamespace };
};

const setupChain = async (model: Model) => {
  const customRagPrompt = PromptTemplate.fromTemplate(customTemplate);
  return createStuffDocumentsChain({
    llm: getLLM(model),
    prompt: customRagPrompt,
    outputParser: new HttpResponseOutputParser(),
  });
};

const handleStreamResponse = async (
  chain: any,
  question: string,
  context: Document[],
  messages: Message[]
) => {
  const constructedMessages = messages.map((message) =>
    message.role === "user"
      ? new HumanMessage(message.content)
      : new AIMessage(message.content)
  );

  const stream = await chain.stream({
    question,
    context,
    history: constructedMessages,
  });

  return new StreamingTextResponse(
    stream.pipeThrough(createStreamDataTransformer())
  );
};

export const POST = async (req: NextRequest) => {
  try {
    const requestBody = (await req.json()) as RequestBody;
    const { userId } = auth();
    const { messages, knowledgeBase, boardId, nodeId, currentChat, model } =
      requestBody;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const question = messages[messages.length - 1].content;

    // Parallel operations
    const [chain, contextData] = await Promise.all([
      setupChain(model),
      createContext(knowledgeBase),
      !currentChat?.title &&
        updateChatTitle(
          userId,
          boardId,
          nodeId,
          currentChat?.id as string,
          question
        ),
      addMessageToDB(
        userId,
        boardId,
        nodeId,
        currentChat?.id as string,
        "user",
        question
      ),
    ]);

    const { rawContext, firstKbWithNamespace } = contextData;

    // @ts-ignore
    if (!firstKbWithNamespace || !firstKbWithNamespace?.data?.namespace) {
      return handleStreamResponse(
        chain,
        question,
        [new Document({ pageContent: rawContext })],
        messages
      );
    }

    // @ts-ignore
    const vectorStore = await getVectorStore(
      // @ts-ignore
      firstKbWithNamespace.data.namespace,
      // @ts-ignore
      firstKbWithNamespace.data.url,
      // @ts-ignore
      firstKbWithNamespace.data.type
    );

    const retriever = vectorStore.asRetriever();
    const retrievedContext = await retriever.invoke(question);

    return handleStreamResponse(
      chain,
      question,
      [...retrievedContext, new Document({ pageContent: rawContext })],
      messages
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
