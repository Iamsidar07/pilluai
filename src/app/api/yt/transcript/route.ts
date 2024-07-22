import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export const POST = async (req: NextRequest) => {
  const requestBody = await req.json();
  const { url } = requestBody;
  if (!url) return new Response("No url found", { status: 400 });
  try {
    const transcriptResponse = await YoutubeTranscript.fetchTranscript(url);

    if (!transcriptResponse)
      return NextResponse.json({
        success: false,
        message: "No transcript found",
      });
    const transcript = transcriptResponse.map((t) => t.text).join("\n");
    return NextResponse.json(
      {
        success: true,
        transcript,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
};
