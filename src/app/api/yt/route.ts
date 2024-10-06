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
    const { videoDetails } = await ytdl.getBasicInfo(url);
    const rawTransciption = await YoutubeTranscript.fetchTranscript(url);
    const transcription = rawTransciption.map((t) => t.text).join("\n");
    console.log({ videoDetails, transcription });
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
