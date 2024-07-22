import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const SYSTEM_PROMPT = `
"You are an expert in image analysis and description generation. Provide a detailed description, title and text of an image.
The description of the text key is as follows:

\`\`\`

1. **Top Section:**
   - Background: [Describe the background].
   - Text: [Describe the text].

2. **Bottom Section:**
   - This section features a screenshot of the [Platform Name] interface.
   - Background: [Describe the background].
   - Logo and Branding: [Describe the logo and branding].
   - Button: [Describe any buttons].
   - Heading: [Describe the main heading].
   - Example Prompt: [Describe any example prompts].
   - Additional Text: [Describe any additional text].

Overall, the image emphasizes [Overall theme or purpose].
\`\`\`
`;

const analyseSchema = z.object({
  title: z.string().describe("Title of the image with emojis"),
  description: z.string().describe("Description of the image"),
  text: z.string().describe("Text extracted from the image"),
});

export const analyseImage = async (
  url: string
): Promise<z.infer<typeof analyseSchema> | null> => {
  try {
    console.log("url:", url);
    const { object } = await generateObject({
      model: google("models/gemini-1.5-flash-latest"),
      schema: analyseSchema,
      system:
        "You are an expert in image analysis and text extraction. Provide a detailed description, title and text extracted of an image.",
      messages: [
        {
          role: "user",
          content: [{ type: "image", image: url }],
        },
      ],
    });
    console.log("object:", object);
    return object;
  } catch (error) {
    console.log("error:", error);
    return null;
  }
};
