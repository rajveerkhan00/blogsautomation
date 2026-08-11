import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isValidSession(request: NextRequest): boolean {
  const cookie = request.cookies.get("admin_session")?.value;
  if (!cookie) return false;
  try {
    const payload = JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
    // Expire after 8 hours (28800 seconds)
    if (!payload.ts || Date.now() - payload.ts > 1000 * 60 * 60 * 8) return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!isValidSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
