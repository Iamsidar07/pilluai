import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite } from "@/scripts";

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
    // const uploadResult = await uploadImageToCloudinary(scrapedData.buffer);
    return NextResponse.json(
      {
        success: true,
        title: scrapedData.title,
        description: scrapedData.description,
        // url: uploadResult?.secure_url,
        buffer: scrapedData.buffer,
        base64: scrapedData.base64,
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
