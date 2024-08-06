"use server";
import { isValidURL } from "@/lib/utils";
import puppeteer from "puppeteer-core";
import { executablePath } from "puppeteer";

const scrapeWebsite = async (url: string) => {
  if (!isValidURL(url)) return null;
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
    ignoreHTTPSErrors: true,
    executablePath: executablePath(),
  });
  try {
    const page = await browser.newPage();
    await page.goto(url);
    const buffer = await page.screenshot({
      type: "png",
      fullPage: true,
      optimizeForSpeed: true,
    });
    const title = await page.title();
    return {
      success: true,
      title,
      buffer,
      base64: buffer.toString("base64"),
    };
  } catch (error) {
    console.log(error);
    return { success: false };
  } finally {
    await browser.close();
  }
};

export default scrapeWebsite;
