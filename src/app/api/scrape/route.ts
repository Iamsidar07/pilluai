import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite } from "@/scripts";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

const prompt = `
Extract the text content from the following webpage screenshot and return the text content directly:
"image"
`;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

export const extractText = async ({
  base64String,
  mimeType,
}: {
  base64String: string;
  mimeType: string;
}): Promise<{ text: string } | null> => {
  const image = {
    inlineData: {
      data: base64String,
      mimeType,
    },
  };
  try {
    const result = await model.generateContent([prompt, image]);
    console.log("result", result.response.text());
    return {
      text: result.response.text(),
    };
  } catch (error) {
    console.log("error:", error);
    return null;
  }
};

export const POST = async (req: NextRequest) => {
  const requestBody = await req.json();
  const { url } = requestBody;
  if (!url) return new Response("No url found", { status: 400 });
  try {
    const scrapedData = await scrapeWebsite(url);
    if (!scrapedData) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to scrape website",
        },
        { status: 500 }
      );
    }

    const imageInfo = await extractText({
      base64String: scrapedData.buffer.toString("base64"),
      mimeType: "image/png",
    });

    const uploadResult = await uploadImageToCloudinary(scrapedData.buffer);

    return NextResponse.json(
      {
        success: true,
        title: scrapedData.title,
        description: scrapedData.description || imageInfo?.text,
        text: imageInfo?.text,
        url: uploadResult?.secure_url,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
};
