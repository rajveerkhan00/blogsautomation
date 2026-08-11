"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  User, Clock, BookOpen, Eye,
  Sparkles, RefreshCw, AlertCircle, CheckCircle2,
} from "../../components/icons";

const PK = "pk_test_Z29sZGVuLWRvYmVybWFuLTMwLmNsZXJrLmFjY291bnRzLmRldiQ";
const CLERK_JS_URL =
  "https://golden-doberman-30.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js";

interface StatsData {
  blogs: { total: number; views: number; likes: number };
  traffic: { uniqueVisitors: number; totalSessions: number; totalPageViews: number; averageDurationMinutes: number };
  popularPages: { path: string; count: number }[];
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

export default function AdminDashboard() {
  const router = useRouter();

  // Auth
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed]           = useState(false);
  const [clerkRef, setClerkRef]       = useState<any>(null);
  const [userEmail, setUserEmail]     = useState("");
  const clerkLoadedRef                = useRef(false);

  // Dashboard stats
  const [stats, setStats]             = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Generation
  const [selectedCategory, setSelectedCategory] = useState<"Tech" | "Movies" | "Health" | "Sports">("Tech");
  const [isGenerating, setIsGenerating]           = useState(false);
  const [genMessage, setGenMessage]               = useState("");
  const [genStatus, setGenStatus]                 = useState<"idle" | "loading" | "success" | "error">("idle");

  // ── Init Clerk once CDN script loads ─────────────────────────────────
  const initClerk = async () => {
    if (clerkLoadedRef.current) return;
    clerkLoadedRef.current = true;

    const clerk = (window as any).Clerk;
    if (!clerk) { router.replace("/admin/login"); return; }

    try {
      if (!clerk.loaded) {
        await clerk.load();
      }
      setClerkRef(clerk);

      if (clerk.user) {
        setUserEmail(clerk.user.primaryEmailAddress?.emailAddress ?? "");
        setAuthed(true);
      } else {
        router.replace("/admin/login");
      }

      // Auto-redirect if user signs out
      clerk.addListener(({ user }: any) => {
        if (!user) router.replace("/admin/login");
      });
    } catch (err) {
      console.error("[Clerk] dashboard init failed:", err);
      router.replace("/admin/login");
    } finally {
      setAuthChecked(true);
    }
  };

  // ── Load Clerk dynamically on mount ───────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const existingScript = document.querySelector(`script[src="${CLERK_JS_URL}"]`);
    if (existingScript) {
      if ((window as any).Clerk) {
        initClerk();
      } else {
        existingScript.addEventListener("load", initClerk);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = CLERK_JS_URL;
    script.setAttribute("data-clerk-publishable-key", PK);
    script.async = true;
    script.onload = initClerk;
    document.head.appendChild(script);
  }, []);



  // ── Fetch stats once authed ────────────────────────────────────────────
  useEffect(() => {
    if (authed) fetchStats();
  }, [authed]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      // Pass Clerk session token for API auth
      const token = await clerkRef?.session?.getToken();
      const res = await fetch("/api/analytics/stats", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error("[AdminStats]", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // ── Blog generation ────────────────────────────────────────────────────
  const triggerGeneration = async (categoryOnly: boolean) => {
    setIsGenerating(true);
    setGenStatus("loading");
    setGenMessage(
      categoryOnly
        ? `Generating a ${selectedCategory} blog… This takes 30–60 seconds.`
        : "Running full 4-category seed… This may take up to 3 minutes."
    );

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: "paragonsoft-generate-2024",
          ...(categoryOnly ? { category: selectedCategory } : {}),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        setGenStatus("success");
        setGenMessage(`✅ ${data.message ?? "Blog saved to MongoDB!"}`);
        fetchStats();
      } else {
        setGenStatus("error");
        setGenMessage(`❌ ${data.error ?? "Generation failed. Check your API credentials."}`);
      }
    } catch (err) {
      setGenStatus("error");
      setGenMessage(`❌ ${err instanceof Error ? err.message : "Network error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    if (clerkRef) {
      await clerkRef.signOut();
    }
    router.push("/admin/login");
  };

  // ── Loading / redirect state ───────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!authed) return null; // will redirect

  // ── Dashboard UI ───────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-bg-base theme-transition">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-color pb-6">
          <div>
            <span
              className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary mb-3 uppercase tracking-widest"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
            >
              Operations Centre
            </span>
            <h1
              className="text-4xl md:text-5xl uppercase leading-none text-text-main"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
            >
              Management Dashboard.
            </h1>
            {userEmail && (
              <p className="text-xs text-text-muted mt-2">
                Signed in as <span className="text-text-main font-semibold">{userEmail}</span>
              </p>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 transition-all cursor-pointer"
          >
            <LogoutIcon className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* ── Stats Grid ──────────────────────────────────────────────── */}
        {isLoadingStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-bg-surface/50 border border-border-color" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <StatCard
              label="Unique Visitors"
              value={stats.traffic.uniqueVisitors.toLocaleString()}
              icon={<User className="h-6 w-6" />}
              color="text-primary"
              bg="bg-primary/10"
            />
            <StatCard
              label="Total Sessions"
              value={stats.traffic.totalSessions.toLocaleString()}
              icon={<Eye className="h-6 w-6" />}
              color="text-secondary"
              bg="bg-secondary/10"
            />
            <StatCard
              label="Avg Session Time"
              value={`${stats.traffic.averageDurationMinutes} min`}
              icon={<Clock className="h-6 w-6" />}
              color="text-accent"
              bg="bg-accent/10"
            />
            <StatCard
              label="Total Articles"
              value={String(stats.blogs.total)}
              icon={<BookOpen className="h-6 w-6" />}
              color="text-green-400"
              bg="bg-green-500/10"
            />

          </div>
        ) : (
          <p className="text-xs text-text-muted">Could not load stats. Check MongoDB connection.</p>
        )}

        {/* ── Controls + Popular Pages ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Seeding Panel */}
          <div className="lg:col-span-7 rounded-3xl p-8 glass-panel border border-border-color space-y-6">
            <div>
              <h3
                className="text-xl font-bold uppercase text-text-main"
                style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
              >
                Manual Database Seeding
              </h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Trigger the AI pipeline — writes the article, generates cover art via Cloudflare,
                uploads to Cloudinary, and saves to MongoDB.
              </p>
            </div>

            {/* Category Pills */}
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2">Select Article Category</label>
              <div className="flex flex-wrap gap-2">
                {(["Tech", "Movies", "Health", "Sports"] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer border ${
                      selectedCategory === cat
                        ? "bg-primary text-white border-primary"
                        : "border-border-color text-text-muted hover:text-text-main bg-bg-base/30"
                    }`}
                    style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={() => triggerGeneration(true)}
                disabled={isGenerating}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-3 px-4 text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                Generate 1 {selectedCategory} Blog
              </button>

              <button
                onClick={() => triggerGeneration(false)}
                disabled={isGenerating}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/30 hover:border-secondary/60 bg-secondary/5 hover:bg-secondary/10 py-3 px-4 text-xs font-bold text-secondary active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                Seed All 4 Categories
              </button>
            </div>

            {/* Pipeline Logs */}
            {genStatus !== "idle" && (
              <div className={`rounded-xl border p-4 space-y-2 ${
                genStatus === "loading"
                  ? "border-primary/20 bg-primary/5 text-primary"
                  : genStatus === "success"
                  ? "border-green-500/20 bg-green-500/5 text-green-400"
                  : "border-red-500/20 bg-red-500/5 text-red-400"
              }`}>
                <div className="flex items-center gap-2">
                  {genStatus === "loading"  && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {genStatus === "success"  && <CheckCircle2 className="h-4 w-4" />}
                  {genStatus === "error"    && <AlertCircle className="h-4 w-4" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">Pipeline Logs</span>
                </div>
                <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {genMessage}
                </p>
              </div>
            )}
          </div>

          {/* Popular Pages */}
          <div className="lg:col-span-5 rounded-3xl p-6 glass-panel border border-border-color space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-xs font-black uppercase tracking-widest text-text-muted"
                style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
              >
                📊 Popular Content Paths
              </h3>
              <button
                onClick={fetchStats}
                className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                aria-label="Refresh stats"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>

            {stats && stats.popularPages.length > 0 ? (
              <div className="space-y-2.5">
                {stats.popularPages.map((page, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-border-color/30 pb-2 last:border-0">
                    <span className="font-mono text-text-muted truncate max-w-[180px]">{page.path}</span>
                    <span className="text-primary font-bold font-mono bg-primary/10 px-2 py-0.5 rounded-md ml-2 shrink-0">
                      {page.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-text-muted">No page hits tracked yet.</p>
                <p className="text-[10px] text-text-muted/60 mt-1">Visit some pages and come back!</p>
              </div>
            )}

            {stats && (
              <div className="mt-4 pt-4 border-t border-border-color/40 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Total Page Views</span>
                  <span className="font-bold text-text-main">{stats.traffic.totalPageViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Total Blog Likes</span>
                  <span className="font-bold text-text-main">{stats.blogs.likes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Total Blog Views</span>
                  <span className="font-bold text-text-main">{stats.blogs.views.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// ── Reusable stat card ─────────────────────────────────────────────────────
function StatCard({
  label, value, icon, color, bg,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-2xl p-6 glass-panel border border-border-color flex items-center justify-between">
      <div>
        <span className="block text-[10px] uppercase font-bold text-text-muted tracking-wider mb-1">{label}</span>
        <span className="block text-3xl font-black text-text-main tabular-nums">{value}</span>
      </div>
      <div className={`h-12 w-12 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
    </div>
  );
}
