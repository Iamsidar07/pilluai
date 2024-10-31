import { storage } from "@/firebase";
import { auth } from "@clerk/nextjs/server";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import puppeteer, { executablePath } from "puppeteer";

export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
    executablePath: executablePath(),
  });
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json("URL not provided", { status: 400 });
    }
    const { userId } = auth().protect();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto(url, { waitUntil: "networkidle2" });
    const buffer = await page.screenshot({
      type: "png",
      optimizeForSpeed: true,
    });
    const title = await page.title();
    const content = await page.evaluate(() => {
      return document.body.innerText;
    });
    const imageRef = ref(storage, `users/${userId}/files/${nanoid()}`);
    const uploadTask = await uploadBytesResumable(imageRef, buffer);
    const imageURL = await getDownloadURL(uploadTask.ref);
    console.log("scraped website", { title, content, imageURL });
    return NextResponse.json(
      {
        success: true,
        title,
        content,
        imageURL,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.log("failed to scrape website with reason: ", e.message);
    return NextResponse.json({ message: e.message }, { status: 500 });
  } finally {
    await browser.close();
  }
};
