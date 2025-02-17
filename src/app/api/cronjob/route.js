import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cron = searchParams.get("cron");

    if (!cron) {
      return NextResponse.json({ error: "Cron expression is required" }, { status: 400 });
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`https://crontab.guru/#${cron}`, { waitUntil: "domcontentloaded" });

    // Ensure the element exists before querying
    await page.waitForSelector("#hr i", { timeout: 5000 });

    const result = await page.evaluate(() => {
      const element = document.querySelector("#hr i");
      return element ? element.innerText : "No result found";
    });

    await browser.close();

    return NextResponse.json({ cronExpression: cron, description: result }, { status: 200 });

  } catch (error) {
    console.error("Error fetching cron description:", error);
    return NextResponse.json({ error: "Failed to fetch cron description" }, { status: 500 });
  }
}
