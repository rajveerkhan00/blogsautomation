import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/lib/models/Blog";

export const dynamic = "force-dynamic";

/**
 * GET /api/blogs
 * Query params:
 *   ?category=Tech|Movies|Health|Sports  (optional)
 *   ?limit=10                             (default 12)
 *   ?page=1                               (default 1)
 *   ?sort=newest|oldest|popular           (default newest)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "12", 10), 50);
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1);
    const sort = searchParams.get("sort") ?? "newest";

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (category && ["Tech", "Movies", "Health", "Sports"].includes(category)) {
      query.category = category;
    }

    // Build sort
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortObj: any =
      sort === "popular" ? { views: -1 } :
      sort === "oldest"  ? { createdAt: 1 } :
      { createdAt: -1 }; // newest (default)

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select("-content") // exclude heavy content field from list view
        .lean(),
      Blog.countDocuments(query),
    ]);

    return NextResponse.json({
      blogs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: skip + blogs.length < total,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[GET /api/blogs] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
