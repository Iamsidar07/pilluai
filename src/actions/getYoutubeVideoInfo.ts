"use server";

import { isValidYoutubeUrl } from "@/lib/utils";
import ytdl from "ytdl-core";

const getYoutubeVideoInfo = async (url: string) => {
  if (!isValidYoutubeUrl(url)) {
    return { success: false };
  }
  try {
    const { videoDetails } = await ytdl.getBasicInfo(url);
    return {
      success: true,
      title: videoDetails.title,
      description: videoDetails.description,
    };
  } catch (e) {
    console.log("Failed to get video details.");
    return {
      success: false,
    };
  }
};
export default getYoutubeVideoInfo;
