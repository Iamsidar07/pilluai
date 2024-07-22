import { NextRequest, NextResponse } from "next/server";
import ytdl from "ytdl-core";

export const POST = async (req: NextRequest) => {
  const requestBody = await req.json();
  const { url } = requestBody;
  if (!url) return new Response("No url found", { status: 400 });
  try {
    const videoInfo = await ytdl.getBasicInfo(url);
    const { title, description } = videoInfo.videoDetails;
    return NextResponse.json(
      {
        success: true,
        title,
        description,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
};
