import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Index } from "@upstash/vector";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { CohereEmbeddings } from "@langchain/cohere";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

export const POST = async (req: NextRequest) => {
  try {
    const { namespace } = await req.json();
    if (!namespace) {
      return NextResponse.json(
        { error: "No namespace provided" },
        { status: 400 },
      );
    }
    let docContext = "";

    try {
      const embeddings = new CohereEmbeddings({
        apiKey: process.env.COHERENCE_API_KEY as string,
        batchSize: 48,
      });
      const index = new Index({
        token: process.env.UPSTASH_API_KEY as string,
        url: process.env.UPSTASH_INDEX_URL as string,
      });

      const vectorStore = new UpstashVectorStore(embeddings, {
        index,
        namespace,
      });
      const docs = await vectorStore.similaritySearch("", 5);
      docContext = docs.map((doc) => doc.pageContent).join("\n\n");
    } catch (error) {
      console.log("Error querying db", error);
      throw new Error("Error querying db");
    }

    const model = genAi.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      generationConfig: {
        temperature: 1,
      },
    });

    const prompt = `As an assistant creating sample questions for a chatbot, provide 4 concise questions, less than 12 words each, based on the given document context.
          Avoid specifying the page. Format your response in json. json format: {"questions": ["question1", "question2", "question3", "question4"]}

          CONTEXT:
          ${docContext}
          END OF CONTEXT`;

    const response = await chat.sendMessage(prompt);
    console.log(JSON.parse(response.response.text()).questions);
    return NextResponse.json(response.response.text());
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};
