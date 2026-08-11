import { NextRequest, NextResponse } from "next/server";
import { generateDailyBlogs, generateOneBlog } from "@/lib/blogGenerator";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow up to 5 minutes for generation

/**
 * POST /api/generate
 * Manual trigger for blog generation — protected by GENERATE_SECRET.
 *
 * Body:
 *   { "secret": "...", "category": "Tech" }   ← generate one category
 *   { "secret": "..." }                         ← generate all 4 categories
 *
 * Example curl:
 *   curl -X POST http://localhost:3000/api/generate \
 *     -H "Content-Type: application/json" \
 *     -d '{"secret":"paragonsoft-generate-2024"}'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { secret?: string; category?: string };
    const { secret, category } = body;

    // Security check
    const expectedSecret = process.env.GENERATE_SECRET ?? "paragonsoft-generate-2024";
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized — wrong secret key" },
        { status: 401 }
      );
    }

    const started = Date.now();

    if (category && ["Tech", "Movies", "Health", "Sports"].includes(category)) {
      // Generate a single category
      const result = await generateOneBlog(category as "Tech" | "Movies" | "Health" | "Sports");
      return NextResponse.json({
        success: result.success,
        message: result.success
          ? `Generated: "${result.title}"`
          : `Failed: ${result.error}`,
        durationMs: Date.now() - started,
      });
    }

    // Generate all 4
    await generateDailyBlogs();
    return NextResponse.json({
      success: true,
      message: "Daily generation complete — check server logs for details",
      durationMs: Date.now() - started,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/generate
 * Returns generation status / next run time
 */
export async function GET() {
  return NextResponse.json({
    message: "ParagonSoftBlogs Auto-Generation API",
    schedule: "Daily at 00:00 (midnight server time)",
    manualTrigger: "POST /api/generate with { secret, category? }",
    categories: ["Tech", "Movies", "Health", "Sports"],
  });
}
