import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/lib/models/Blog";

export const dynamic = "force-dynamic";

/**
 * GET /api/blogs/[slug]
 * Returns full blog including content field
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const blog = await Blog.findOne({ slug }).lean();

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Increment view count (fire and forget)
    Blog.findOneAndUpdate({ slug }, { $inc: { views: 1 } }).exec();

    return NextResponse.json({ blog });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
