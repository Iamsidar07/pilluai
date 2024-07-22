import { analyseImage } from "@/lib/analyseImage";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const requestBody = await req.json();
  const { url } = requestBody;
  console.log("url:", url);
  try {
    const imageInfo = await analyseImage(url);
    if (!imageInfo) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate image info",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      ...imageInfo,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ success: false, error: error.message });
  }
};
