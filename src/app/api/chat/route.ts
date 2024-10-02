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
import { createStreamDataTransformer, StreamingTextResponse } from "ai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

const llm = new ChatMistralAI({
  model: "mistral-large-latest",
  temperature: 0,
});

const customTemplate = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.
Always say "thanks for asking!" at the end of the answer. Use emojis whenever needed.

{context}

Question: {question}

Helpful Answer:`;

export const POST = async (req: NextRequest) => {
  try {
    const requestBody = await req.json();
    const { userId } = auth();
    const { messages, knowledgeBase, boardId, nodeId, currentChatId } =
      requestBody;
    if (!userId) {
      return NextResponse.json(
        { message: "You are not authorized to access this route" },
        { status: 401 },
      );
    }

    const question = messages[messages?.length - 1].content;
    let rawContext = "";
    let firstKbWithNamespace;
    knowledgeBase?.map((kb) => {
      if (kb?.data.namespace && !firstKbWithNamespace) {
        firstKbWithNamespace = kb;
      } else {
        // rowContext += `metadata: ${kb.metadata} \n\n ${kb.context} \n\n`;
        rawContext += `${kb.data.text} \n\n`;
      }
    });
    const constructedMessages = messages.map((message) =>
      message.role === "user"
        ? new HumanMessage(message.content)
        : new AIMessage(message.content),
    );

    let vectorStore: UpstashVectorStore;
    if (
      firstKbWithNamespace?.data?.namespace &&
      isNamespaceExists(firstKbWithNamespace?.data.namespace || "", index)
    ) {
      vectorStore = await UpstashVectorStore.fromExistingIndex(embeddings, {
        index,
        namespace: firstKbWithNamespace.data.namespace,
      });
    } else {
      const loader = await getLoader({
        url: firstKbWithNamespace.data.url,
        type: firstKbWithNamespace.data.type,
      });
      const docs = await loader.load();
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 200,
        chunkSize: 1000,
      });
      const splits = await textSplitter.splitDocuments(docs);
      vectorStore = new UpstashVectorStore(embeddings, {
        namespace: firstKbWithNamespace.data.namespace,
        index,
      });
      await vectorStore.addDocuments(splits);
    }

    // Retrieve and generate using the relevant snippets of the blog.
    const retriever = vectorStore.asRetriever();
    const customRagPrompt = PromptTemplate.fromTemplate(customTemplate);

    const customRagChain = await createStuffDocumentsChain({
      llm: llm,
      prompt: customRagPrompt,
      outputParser: new HttpResponseOutputParser(),
    });
    const context = await retriever.invoke(question);
    // const ragChain = await createStuffDocumentsChain({
    //   llm,
    //   prompt,
    //   outputParser: new StringOutputParser(),
    // });
    // const response = await ragChain.invoke({
    //   question: constructedQuestion,
    //   context: retrievedDocs,
    // });

    const stream = await customRagChain.stream({
      question,
      context: context,
      history: constructedMessages,
    });
    // for await (const chunk of stream) {
    // }
    // addMessageToDb(
    //   userId,
    //   boardId,
    //   nodeId,
    //   currentChatId,
    //   "assistant",
    //   question
    // );
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
        role: "user",
        content: question,
        createdAt: new Date(),
      });
    return new StreamingTextResponse(
      stream.pipeThrough(createStreamDataTransformer()),
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};

/* Please analyze the attached content and provide the output in the following object format:

json

{
  "title": "your_title_here 🌐",
  "description": "your_detailed_description_here"
}

    Title: Create a concise title that includes the type of content and an appropriate emoji. For example:
        web_app_overview 🌐
        project_management_tool 📊

    Description: Include the following elements in your description:
        Overview: Briefly introduce the main theme or purpose of the content.
        Key Features: Identify and describe important components or sections.
        Context: Provide relevant background information.
        User Interaction: Discuss user engagement and input mechanisms.
        Conclusion: Summarize the overall implications or uses.
*/
