/**
 * instrumentation.ts  — Next.js App Router lifecycle hook
 * ──────────────────────────────────────────────────────
 * Runs once when the Next.js server starts.
 * NOTE: node-cron is NOT used here because Vercel uses serverless functions
 * which are stateless and short-lived — cron jobs won't persist.
 * Use Vercel Cron Jobs (vercel.json) to trigger /api/generate on a schedule.
 */

export async function register() {
  // Only run in Node.js runtime (not Edge), and only on the server
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const connectDB = (await import("./lib/mongodb")).default;

    // Connect to MongoDB on startup
    try {
      await connectDB();
      console.log("[ParagonSoftBlogs] ✅ MongoDB connected");
    } catch (err) {
      console.error("[ParagonSoftBlogs] ❌ MongoDB connection failed:", err);
      // Do NOT re-throw — let the server continue starting up
    }
  }
}
