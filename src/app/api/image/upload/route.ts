import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const requestBody = await req.json();
  const buffer = requestBody.buffer.data;
  const arrayBuffer = new Uint8Array(buffer);
  try {
    const cloudinaryRes = await uploadImageToCloudinary(arrayBuffer);
    return NextResponse.json({
      url: cloudinaryRes?.secure_url,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message });
  }
};
