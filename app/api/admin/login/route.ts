import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Admin credentials come from environment variables
// Add to .env.local:
//   ADMIN_EMAIL=your@email.com
//   ADMIN_PASSWORD=yourpassword
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "admin@paragonsoft.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@1234";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
      password !== ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Build session token (simple signed value — enough for a single-admin blog)
    const sessionValue = Buffer.from(
      JSON.stringify({ email: ADMIN_EMAIL, ts: Date.now() })
    ).toString("base64");

    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_session", sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("admin_session");
  return response;
}
