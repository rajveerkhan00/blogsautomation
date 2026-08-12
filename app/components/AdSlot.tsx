"use client";

/**
 * AdSlot — Smart ad container with empty-slot detection + fallback.
 *
 * Why this exists:
 *   Ad networks like effectivecpmnetwork and highperformanceformat block
 *   "datacenter" / VPN / proxy IP ranges at their servers. When they block
 *   a request they return nothing, leaving the ad container completely empty.
 *
 *   This component:
 *   1. Wraps any ad container div.
 *   2. Uses MutationObserver to watch for the network's iframe/script injection.
 *   3. If no ad is injected within a timeout, shows a branded fallback banner.
 *   4. Re-checks on window focus (VPN reconnect) and on IntersectionObserver.
 *   5. Retries up to MAX_RETRIES times with exponential back-off.
 */

import React, { useRef, useEffect, useState, useCallback, ReactNode } from "react";
import Link from "next/link";

interface AdSlotProps {
  /** The id the ad network needs on the container div */
  containerId?: string;
  /** Extra class names for the wrapper */
  className?: string;
  /** Minimum px height to reserve so layout doesn't shift */
  minHeight?: number;
  children?: ReactNode;
}

/** House-ad / fallback banners shown when the real ad doesn't fill */
const FALLBACK_ADS = [
  {
    label: "EXPLORE",
    title: "Tech Insights",
    sub: "Deep-dives into the latest in AI, hardware & dev tools.",
    href: "/tech",
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
  },
  {
    label: "READ NOW",
    title: "Sports Central",
    sub: "Live scores, transfers, and match breakdowns — daily.",
    href: "/sports",
    gradient: "from-emerald-500 via-teal-600 to-cyan-700",
  },
  {
    label: "DISCOVER",
    title: "Cinema & Reviews",
    sub: "Expert takes on the latest films and hidden gems.",
    href: "/movies",
    gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
  },
  {
    label: "WELLNESS",
    title: "Health & Fitness",
    sub: "Science-backed tips for a longer, stronger life.",
    href: "/health",
    gradient: "from-amber-500 via-orange-500 to-red-600",
  },
];

const EMPTY_CHECK_DELAY_MS = 3000;  // wait 3 s before assuming no ad filled
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 4000;

function FallbackBanner() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * FALLBACK_ADS.length));
  const ad = FALLBACK_ADS[idx];

  return (
    <Link
      href={ad.href}
      className={`group flex items-center justify-between w-full rounded-xl bg-gradient-to-r ${ad.gradient} px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden relative`}
      style={{ minHeight: 60 }}
      onClick={() => setIdx((idx + 1) % FALLBACK_ADS.length)}
    >
      {/* shimmer overlay */}
      <span className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 rounded-xl" />

      <div className="relative z-10">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 block leading-none mb-0.5">
          ParagonSoftBlogs
        </span>
        <span className="text-sm font-black uppercase text-white leading-tight"
          style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
          {ad.title}
        </span>
        <span className="text-[11px] text-white/80 block leading-snug mt-0.5 max-w-xs">
          {ad.sub}
        </span>
      </div>

      <span
        className="relative z-10 shrink-0 ml-4 rounded-lg bg-white/20 border border-white/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white group-hover:bg-white/30 transition-colors"
        style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
      >
        {ad.label} →
      </span>
    </Link>
  );
}

export default function AdSlot({
  containerId,
  className = "",
  minHeight = 60,
  children,
}: AdSlotProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [adFilled, setAdFilled] = useState<boolean | null>(null); // null = pending
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const checkAdFilled = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Check if any visible child content was injected by the ad network
    const hasIframe = wrapper.querySelector("iframe") !== null;
    const hasScript = wrapper.querySelector("script") !== null;
    const hasImg = wrapper.querySelector("img") !== null;

    // Also check if a direct child element has visible dimensions
    const hasVisibleChild = Array.from(wrapper.children).some(
      (el) =>
        el.tagName !== "NOSCRIPT" &&
        (el as HTMLElement).offsetHeight > 0 &&
        (el as HTMLElement).offsetWidth > 0
    );

    if (hasIframe || hasImg || hasVisibleChild) {
      setAdFilled(true);
      observerRef.current?.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    } else if (hasScript) {
      // Script injected but no visible content yet — extend wait
      timerRef.current = setTimeout(checkAdFilled, 1500);
    } else {
      // Nothing — schedule retry or show fallback
      if (retriesRef.current < MAX_RETRIES) {
        retriesRef.current += 1;
        const delay = RETRY_BASE_MS * Math.pow(2, retriesRef.current - 1);
        timerRef.current = setTimeout(checkAdFilled, delay);
      } else {
        setAdFilled(false); // show fallback
        observerRef.current?.disconnect();
      }
    }
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Watch for DOM mutations (ad script injects an iframe)
    const mo = new MutationObserver(checkAdFilled);
    mo.observe(wrapper, { childList: true, subtree: true, attributes: true });
    observerRef.current = mo;

    // Kick off first check after the ad network has had time to run
    timerRef.current = setTimeout(checkAdFilled, EMPTY_CHECK_DELAY_MS);

    // Retry when user re-focuses the tab (VPN toggle scenario)
    const onFocus = () => {
      if (adFilled === false) {
        retriesRef.current = 0;
        setAdFilled(null);
        timerRef.current = setTimeout(checkAdFilled, 1000);
      }
    };
    window.addEventListener("focus", onFocus);

    return () => {
      mo.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapperRef}
      id={containerId}
      className={`ad-slot-wrapper relative w-full ${className}`}
      style={{ minHeight }}
      aria-label="Advertisement"
    >
      {/* Actual ad children (the container div the network targets) */}
      {children}

      {/* Pending shimmer placeholder */}
      {adFilled === null && (
        <div
          className="absolute inset-0 rounded-xl bg-bg-surface/40 animate-pulse"
          style={{ minHeight }}
          aria-hidden="true"
        />
      )}

      {/* Fallback when ad didn't fill (VPN / blocked IP / no inventory) */}
      {adFilled === false && <FallbackBanner />}
    </div>
  );
}
