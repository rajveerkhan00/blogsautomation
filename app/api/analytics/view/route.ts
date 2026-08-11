import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Analytics from "@/lib/models/Analytics";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json() as {
      visitorId: string;
      path: string;
      heartbeat?: boolean;
    };

    const { visitorId, path, heartbeat } = body;
    if (!visitorId || !path) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const now = new Date();
    const userAgent = request.headers.get("user-agent") ?? "";

    // Find active session in last 30 minutes
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    let session = await Analytics.findOne({
      visitorId,
      lastActiveAt: { $gte: thirtyMinsAgo },
    });

    if (!session) {
      // Create new session
      session = await Analytics.create({
        visitorId,
        sessionStartedAt: now,
        lastActiveAt: now,
        visits: [{ path, visitedAt: now, durationSeconds: heartbeat ? 10 : 0 }],
        userAgent,
      });
    } else {
      // Update existing session
      session.lastActiveAt = now;

      // Find if we already recorded a visit to this path in the current session
      const lastVisit = session.visits[session.visits.length - 1];
      if (lastVisit && lastVisit.path === path) {
        if (heartbeat) {
          lastVisit.durationSeconds += 10;
        }
      } else if (!heartbeat) {
        // Navigated to a new path
        session.visits.push({ path, visitedAt: now, durationSeconds: 0 });
      }

      await session.save();
    }

    return NextResponse.json({ success: true, sessionActive: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
