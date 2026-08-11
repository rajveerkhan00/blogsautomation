import { NextRequest } from "next/server";

export interface ClerkUser {
  userId: string;
}

/**
 * Verifies the Clerk session token from either:
 *  1. Authorization: Bearer <token> header  (sent by the admin dashboard)
 *  2. __session cookie                        (standard Clerk browser cookie)
 *
 * Decodes the JWT and validates its expiration time.
 */
export async function getClerkUser(request: NextRequest): Promise<ClerkUser | null> {
  // 1. Try Authorization header first (Bearer token sent by the dashboard)
  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  // 2. Fallback to __session cookie
  const cookieToken = request.cookies.get("__session")?.value ?? null;

  const sessionToken = bearerToken || cookieToken;
  if (!sessionToken) return null;

  try {
    const parts = sessionToken.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));

    // Validate expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn("[ClerkAuth] Token expired");
      return null;
    }

    // Must have a subject (user ID)
    if (!payload.sub) return null;

    return { userId: payload.sub };
  } catch (err) {
    console.error("[ClerkAuth] Failed to parse session token:", err);
    return null;
  }
}
