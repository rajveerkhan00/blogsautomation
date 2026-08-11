/**
 * instrumentation.ts  — Next.js App Router lifecycle hook
 * ──────────────────────────────────────────────────────
 * Runs once when the Next.js server starts.
 * Sets up a node-cron job to generate 4 blogs every 24 hours at midnight.
 */

export async function register() {
  // Only run in Node.js runtime (not Edge), and only on the server
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { generateDailyBlogs } = await import("./lib/blogGenerator");
    const cron = await import("node-cron");
    const connectDB = (await import("./lib/mongodb")).default;

    // Connect to MongoDB on startup
    try {
      await connectDB();
      console.log("[ParagonSoftBlogs] ✅ MongoDB connected");
    } catch (err) {
      console.error("[ParagonSoftBlogs] ❌ MongoDB connection failed:", err);
    }

    // ── Schedule: Every day at midnight (00:00) ──────────────────────────────
    // Cron syntax: minute hour day month weekday
    cron.schedule("0 0 * * *", async () => {
      console.log("[ParagonSoftBlogs] ⏰ Daily cron triggered — generating 4 blogs...");
      await generateDailyBlogs();
    });

    console.log("[ParagonSoftBlogs] 🕛 Daily blog scheduler set — runs every day at midnight");

    // ── Seed run: Generate immediately if no blogs exist yet ─────────────────
    const Blog = (await import("./lib/models/Blog")).default;
    const count = await Blog.countDocuments();
    if (count === 0) {
      console.log("[ParagonSoftBlogs] 📦 No blogs found — running initial seed generation...");
      await generateDailyBlogs();
    } else {
      console.log(`[ParagonSoftBlogs] 📚 ${count} blogs already in MongoDB — scheduler ready`);
    }
  }
}
