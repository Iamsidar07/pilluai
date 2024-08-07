"use server";
import { isValidURL } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import puppeteer from "puppeteer";
import { executablePath } from "puppeteer";

const scrapeWebsite = async (url: string) => {
  auth().protect();
  if (!isValidURL(url)) return null;
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
    ignoreHTTPSErrors: true,
    executablePath: executablePath(),
  });
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto(url, { waitUntil: "networkidle2" });
    const base64 = await page.screenshot({
      type: "png",
      optimizeForSpeed: true,
      encoding: "base64",
    });
    const title = await page.title();
    return {
      success: true,
      title,
      base64,
    };
  } catch (error) {
    console.log("Failed to scrape", error);
    return { success: false };
  } finally {
    await browser.close();
  }
};

export default scrapeWebsite;
