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
import axios from "axios";

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

const customTemplate = `You are a helpful, knowledgeable assistant with expertise in analyzing and explaining information.

Use the following context to answer the user's question:
{context}

Question: {question}

Guidelines for your response:
1. Answer accurately based on the provided context
2. If the information isn't in the context, acknowledge this clearly rather than guessing
3. Provide concise but complete answers with relevant details
4. Use a friendly, conversational tone
5. Structure complex information with bullet points or numbered lists when appropriate
6. Include specific examples from the context when relevant
7. End your response with a brief, friendly closing phrase and an appropriate emoji
8. If the user asks for code or technical explanations, format them clearly

Helpful Answer:`;

const vectorStoreCache: Record<string, UpstashVectorStore> = {};

const llmConfig = {
  temperature: 0,
  // maxTokens: 1024,
};

const getLLM = (model: Model) => {
  if (model.id === "google-generative-ai") {
    // For Google Generative AI, we can include images in the messages
    return new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      // maxOutputTokens: 1024,
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      ...llmConfig,
    });
  } else {
    // For Mistral, we don't include images
    return new ChatMistralAI({
      model: "mistral-large-latest",
      ...llmConfig,
    });
  }
};

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
  let imageUrls: string[] = [];

  knowledgeBase.forEach((kb) => {
    // @ts-ignore
    if (kb?.data.namespace && !firstKbWithNamespace) {
      firstKbWithNamespace = kb;
    } else {
      // @ts-ignore
      rawContext += `${kb.data?.metadata && `metadata: ${kb.data.metadata}`} \n\n context: ${kb.data?.text} \n\n`;
    }

    // Collect image URLs for multimodal input
    // @ts-ignore
    if (kb.data?.type === "webScrapperNode" && kb.data?.screenshotUrl) {
      // @ts-ignore
      imageUrls.push(kb.data.screenshotUrl);
    }
    // @ts-ignore
    else if (kb.data?.type === "imageNode" && kb.data?.url) {
      // @ts-ignore
      imageUrls.push(kb.data.url);
    }
  });
  return { rawContext, firstKbWithNamespace, imageUrls };
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
  messages: Message[],
  model: Model,
  imageUrls: string[] = []
) => {
  // Create base messages from history
  const constructedMessages = messages.map((message) =>
    message.role === "user"
      ? new HumanMessage(message.content)
      : new AIMessage(message.content)
  );

  // For Google Generative AI with images
  if (model.id === "google-generative-ai" && imageUrls.length > 0) {
    // Create a multimodal message with both text and images
    const lastUserMessage = messages[messages.length - 1];

    // Replace the last user message with one that includes images
    if (lastUserMessage.role === "user") {
      const multimodalContent = [
        {
          type: "text",
          text: lastUserMessage.content,
        },
        ...imageUrls.map((url) => ({
          type: "image_url",
          image_url: {
            url: url,
          },
        })),
      ];

      // Replace the last message with our multimodal message
      constructedMessages[constructedMessages.length - 1] = new HumanMessage({
        content: multimodalContent,
      });
    }
  }

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
    const contextData = createContext(knowledgeBase);
    const { rawContext, firstKbWithNamespace, imageUrls } = contextData;

    const chain = await setupChain(model);

    // Update chat title and add message to DB
    if (!currentChat?.title) {
      await updateChatTitle(
        userId,
        boardId,
        nodeId,
        currentChat?.id as string,
        question
      );
    }

    await addMessageToDB(
      userId,
      boardId,
      nodeId,
      currentChat?.id as string,
      "user",
      question
    );

    // @ts-ignore
    if (!firstKbWithNamespace || !firstKbWithNamespace?.data?.namespace) {
      return handleStreamResponse(
        chain,
        question,
        [new Document({ pageContent: rawContext })],
        messages,
        model,
        imageUrls
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
      messages,
      model,
      imageUrls
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
