"use server";

import { isValidYoutubeUrl } from "@/lib/utils";
import { YoutubeTranscript } from "youtube-transcript";

const getVideoTranscription = async (url: string) => {
  if (!isValidYoutubeUrl(url)) {
    return { success: false };
  }
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    const text = transcript.map((t) => t.text).join("\n");
    return {
      success: true,
      text,
    };
  } catch (e) {
    console.log("Failed to get video details.");
    return {
      success: false,
    };
  }
};
export default getVideoTranscription;
