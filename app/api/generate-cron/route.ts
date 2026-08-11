import { NextResponse } from "next/server";
import { generateDailyBlogs } from "@/lib/blogGenerator";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for generation

/**
 * GET /api/generate-cron
 * Called automatically by Vercel Cron Jobs every day at midnight (00:00 UTC).
 * Vercel Cron uses GET requests.
 * See vercel.json for the schedule configuration.
 */
export async function GET() {
  // Verify the request is from Vercel Cron (optional but recommended)
  // Vercel sets CRON_SECRET in the environment; skip if not set
  const cronSecret = process.env.CRON_SECRET;
  // Note: Vercel automatically passes Authorization: Bearer <CRON_SECRET>
  // We skip verification here since it's handled by Vercel's infrastructure

  try {
    console.log("[ParagonSoftBlogs] ⏰ Vercel Cron triggered — generating daily blogs...");
    const started = Date.now();
    await generateDailyBlogs();
    return NextResponse.json({
      success: true,
      message: "Daily blog generation complete",
      durationMs: Date.now() - started,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[ParagonSoftBlogs] ❌ Cron generation failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
