"use server";

import { isValidYoutubeUrl } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import ytdl from "ytdl-core";

const getYoutubeVideoInfo = async (url: string) => {
  auth().protect();
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
