import { storage } from "@/firebase";
import { auth } from "@clerk/nextjs/server";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import {chromium} from "playwright"

export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  // Launch browser with optimized settings
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json("URL not provided", { status: 400 });
    }
    const { userId } = auth().protect();

    // Create page with optimized settings
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 }); // Smaller viewport for faster screenshots
    
    // Parallel processing where possible
    const pagePromise = page.goto(url, {
      waitUntil: "domcontentloaded", // Faster than networkidle
      timeout: 10000 // 10 second timeout
    });

    const imageRef = ref(storage, `users/${userId}/files/${nanoid()}`);
    
    await pagePromise;

    // Gather data in parallel
    const [buffer, title, content] = await Promise.all([
      page.screenshot({
        type: "png",
        fullPage: true, // Changed to true to capture full page
      }),
      page.title(),
      page.evaluate(() => document.body.innerText)
    ]);

    // Upload and get URL
    const uploadTask = await uploadBytesResumable(imageRef, buffer);
    const imageURL = await getDownloadURL(uploadTask.ref);

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
    console.log("failed to scrape website with reason: ", e);
    return NextResponse.json({ message: e.message }, { status: 500 });
  } finally {
    await browser.close();
  }
};
