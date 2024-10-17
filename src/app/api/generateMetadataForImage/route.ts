import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { mistral } from "@ai-sdk/mistral";

export const runtime = "nodejs";

const prompt = `Please analyze the attached content and do not put line breaks and ensure that any other special characters are properly escape:
    title: Create a concise title that includes the type of content and an appropriate emoji. For example:

    description: Include the following elements in your description:
        Overview: Briefly introduce the main theme or purpose of the content.
        Key Features: Identify and describe important components or sections.
        Context: Provide relevant background information.
        User Interaction: Discuss user engagement and input mechanisms.
        Conclusion: Summarize the overall implications or uses.
`;

export const POST = async (req: NextRequest) => {
  try {
    const { url } = await req.json();
    if (!url)
      return NextResponse.json({ error: "No url provided" }, { status: 400 });
    const result = await generateObject({
      mode: "json",
      // @ts-ignore
      model: mistral("pixtral-12b-2409"),
      // system: prompt,
      schema: z.object({
        title: z.string(),
        description: z.string(),
      }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: url,
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });
    return NextResponse.json(result.object, { status: 200 });
  } catch (error: any) {
    console.log("failed to generate metadata for image", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
