import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import ytdl from "ytdl-core";

export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  try {
    const { url } = await req.json();
    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json("URL not provided or Invalid url", {
        status: 400,
      });
    }

    // Fetch video details and transcript in parallel
    const [{ videoDetails }, rawTransciption] = await Promise.all([
      ytdl.getBasicInfo(url),
      YoutubeTranscript.fetchTranscript(url)
    ]);

    // Process transcript
    const transcription = rawTransciption.map((t) => t.text).join("\n");

    return NextResponse.json(
      {
        videoDetails,
        transcription,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.log("failed to scrape website with reason: ", e.message);
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
};
