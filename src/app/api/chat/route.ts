import { NextRequest } from "next/server";
import { CoreMessage, ImagePart, Message, streamText, UserContent } from "ai";
import { AppNode } from "@/components/nodes";
import { google } from "@ai-sdk/google";
import { Index } from "@upstash/vector";
import { CohereEmbeddings } from "@langchain/cohere";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { nanoid } from "nanoid";
import { Chat } from "../../../../typing";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { adminDb } from "@/firebaseAdmin";

const index = new Index({
  url: process.env.UPSTASH_INDEX_URL as string,
  token: process.env.UPSTASH_API_KEY as string,
});

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERENCE_API_KEY as string,
  batchSize: 48,
});

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_API_KEY as string,
  model: "gemini-1.5-flash-latest",
});

const formatCoreMessage = (messages: Message[]) =>
  messages.map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );

async function handleVectorQuery(
  namespace: string,
  messages: Message[],
  query: string
) {
  const vectorStore = await UpstashVectorStore.fromExistingIndex(embeddings, {
    index,
    namespace,
  });
  const retriever = vectorStore.asRetriever();

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...formatCoreMessage(messages),
    ["user", "{input}"],
    [
      "user",
      "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation.",
    ],
  ]);

  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer the user's question based on the context: \n\n{context}",
    ],
    ...formatCoreMessage(messages),
    ["user", "{input}"],
  ]);

  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareRetrievalPrompt,
  });

  const conversationRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });
  const reply = await conversationRetrievalChain.invoke({
    chat_history: formatCoreMessage(messages),
    input: query,
  });
  console.log("reply:", reply.answer);
  console.log("context:", reply.context);
  return reply.answer;
}

export const POST = async (req: NextRequest) => {
  try {
    const {
      messages,
      knowledgeBaseNodes,
      userId,
      boardId,
      nodeId,
      currentChat,
    }: {
      messages: Message[];
      knowledgeBaseNodes: AppNode[];
      userId: string;
      boardId: string;
      nodeId: string;
      currentChat: Chat;
    } = await req.json();
    // @ts-ignore

    const lastMessage = messages[messages?.length - 1];
    const imageAndWebScraperNodes = knowledgeBaseNodes.filter(
      (node) => node.type === "imageNode" || node.type === "webScrapperNode"
    );
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("boards")
      .doc(boardId)
      .collection("chatNodes")
      .doc(nodeId)
      .collection("chats")
      .doc(currentChat.id)
      .collection("messages")
      .add({
        id: nanoid(),
        role: "user",
        content: lastMessage.content,
        createdAt: new Date(),
      });

    const imagePrompt = imageAndWebScraperNodes.map((node) => {
      if (node.type === "webScrapperNode") {
        return {
          type: "image",
          image: node.data.screenshotUrl as string,
        } as ImagePart;
      }
      // @ts-ignore
      return { type: "image", image: node.data.url as string } as ImagePart;
    });

    const textPromise = knowledgeBaseNodes?.map(async (node) => {
      // @ts-ignore
      if (node.data && node.data?.namespace) {
        // @ts-ignore
        const namespace = node.data.namespace;
        return await handleVectorQuery(
          namespace,
          messages,
          lastMessage.content
        );
      }
      // @ts-ignore
      return node.data.text;
    });
    console.log("textPromise:", await Promise.all(textPromise));

    const text = (await Promise.all(textPromise)).join("\n");
    console.log("text:", text);

    const prompt: UserContent = [
      {
        type: "text",
        text: `
        <question>
        ${lastMessage.content}
        </question>
        <context>
        ${text}
        </context>
        `,
      },
      ...imagePrompt,
    ];

    const result = await streamText({
      model: google("models/gemini-1.5-flash-latest"),
      system: `
        Answer the user's question based on the context`,
      messages: [
        ...(messages as CoreMessage[]),
        { role: "user", content: prompt },
      ],
      onFinish: async ({ text }) => {
        console.log("finished...");
        try {
          console.log("Adding message to the collection...");
          await adminDb
            .collection("users")
            .doc(userId)
            .collection("boards")
            .doc(boardId)
            .collection("chatNodes")
            .doc(nodeId)
            .collection("chats")
            .doc(currentChat.id)
            .collection("messages")
            .add({
              id: nanoid(),
              role: "assistant",
              content: text,
              createdAt: new Date(),
            });
        } catch (error) {
          console.log("Failed to add message to the collection: ", error);
        }

        if (currentChat.title === null) {
          try {
            console.log("Updating chat title...");
            await adminDb
              .collection("users")
              .doc(userId)
              .collection("boards")
              .doc(boardId)
              .collection("chatNodes")
              .doc(nodeId)
              .collection("chats")
              .doc(currentChat.id)
              .update({
                title: lastMessage.content,
              });
          } catch (error) {
            console.log("Failed to update chat title: ", error);
          }
        }
      },
    });
    return result.toAIStreamResponse();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
