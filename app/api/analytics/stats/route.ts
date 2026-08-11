import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Analytics from "@/lib/models/Analytics";
import Blog from "@/lib/models/Blog";
import { getClerkUser } from "@/lib/clerk";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate using Clerk session token
    const user = await getClerkUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    await connectDB();

    // 2. Fetch Blog Stats
    const totalBlogs = await Blog.countDocuments();
    const allBlogs = await Blog.find({}, { views: 1, likes: 1 }).lean();
    
    let totalViews = 0;
    let totalLikes = 0;
    allBlogs.forEach((b) => {
      totalViews += b.views || 0;
      totalLikes += b.likes || 0;
    });

    // 3. Fetch Analytics Stats
    const totalSessions = await Analytics.countDocuments();
    
    // Total unique visitors (unique visitorId)
    const uniqueVisitorsResult = await Analytics.distinct("visitorId");
    const uniqueVisitors = uniqueVisitorsResult.length;

    // Calculate session durations and page views
    const allSessions = await Analytics.find({}, { visits: 1, sessionStartedAt: 1, lastActiveAt: 1 }).lean();
    
    let totalDurationSeconds = 0;
    let totalPageViews = 0;

    allSessions.forEach((sess) => {
      totalPageViews += sess.visits?.length ?? 0;
      
      // Calculate session duration as difference between last active and started
      const durationMs = new Date(sess.lastActiveAt).getTime() - new Date(sess.sessionStartedAt).getTime();
      const durationSec = Math.max(0, Math.floor(durationMs / 1000));
      totalDurationSeconds += durationSec;
    });

    const averageDurationMinutes =
      totalSessions > 0
        ? Math.round((totalDurationSeconds / totalSessions / 60) * 10) / 10
        : 0;

    // Fetch popular pages list
    const pageViewCounts: Record<string, number> = {};
    allSessions.forEach((sess) => {
      sess.visits?.forEach((v: any) => {
        pageViewCounts[v.path] = (pageViewCounts[v.path] || 0) + 1;
      });
    });

    const popularPages = Object.entries(pageViewCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return NextResponse.json({
      blogs: {
        total: totalBlogs,
        views: totalViews,
        likes: totalLikes,
      },
      traffic: {
        uniqueVisitors,
        totalSessions,
        totalPageViews,
        averageDurationMinutes,
      },
      popularPages,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
