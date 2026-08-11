"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Simple helper to get or create a unique visitor ID
function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  let visitorId = localStorage.getItem("paragon_visitor_id");
  if (!visitorId) {
    visitorId = "vis_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem("paragon_visitor_id", visitorId);
  }
  return visitorId;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Avoid logging admin pages
    if (pathname.startsWith("/admin")) return;

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    // 1. Report initial page view
    const reportView = async (isHeartbeat = false) => {
      try {
        await fetch("/api/analytics/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            path: pathname,
            heartbeat: isHeartbeat,
          }),
        });
      } catch (err) {
        console.error("[Analytics] Send error:", err);
      }
    };

    reportView(false);

    // 2. Set up heartbeat interval every 10 seconds to track active reading duration
    const interval = setInterval(() => {
      reportView(true);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [pathname]);

  return null;
}
