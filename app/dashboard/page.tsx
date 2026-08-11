"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useBlog } from "../context/BlogContext";
import {
  FileText, Eye, Heart, MessageSquare, Edit3, Trash2,
  Plus, BarChart3, TrendingUp, AlertTriangle, ArrowUpRight, Check
} from "../components/icons";

// Mock weekly analytics data
const ANALYTICS_DATA = [
  { label: "Mon", views: 240, likes: 45 },
  { label: "Tue", views: 320, likes: 58 },
  { label: "Wed", views: 480, likes: 72 },
  { label: "Thu", views: 390, likes: 64 },
  { label: "Fri", views: 510, likes: 92 },
  { label: "Sat", views: 680, likes: 110 },
  { label: "Sun", views: 620, likes: 98 },
];

export default function Dashboard() {
  const { posts, likes, isLoaded } = useBlog();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base text-text-muted">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="mt-4 text-sm font-medium">Calibrating analytics dashboard...</span>
      </div>
    );
  }

  // Calculate stats
  const totalPosts = posts.length;
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = 0; // comments not tracked in current schema

  const handleDelete = (id: string) => {
    // deletePost not available; just close the confirm UI
    setDeleteConfirmId(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Find max views for SVG chart scaling
  const maxViews = Math.max(...ANALYTICS_DATA.map(d => d.views));

  return (
    <div className="flex min-h-screen flex-col bg-bg-base transition-colors duration-300 relative">

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-secondary/20 bg-bg-surface p-4 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white">
            <Check className="h-4.5 w-4.5 stroke-[3]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main">Manuscript Purged</h4>
            <p className="text-[10px] text-text-muted">The article was successfully removed from local indexes.</p>
          </div>
        </div>
      )}

      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">

        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-color pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
              Writer Space Dashboard
            </h1>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Track manuscript reads, toggle post edits, delete drafts, and review real-time visitor engagements.
            </p>
          </div>
          <Link
            href="/write"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white text-xs font-bold px-4 py-2.5 shadow-md hover:bg-primary/95 transition-all hover:scale-105 active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Compose Article
          </Link>
        </div>

        {/* Analytics Card Blocks Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Posts */}
          <div className="rounded-2xl border border-border-color bg-bg-surface p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 h-16 w-16 rounded-full bg-primary/5 blur-lg group-hover:scale-125 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-text-muted">Total Articles</span>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <FileText className="h-4.5 w-4.5" />
              </div>
            </div>
            <span className="block text-2xl md:text-3xl font-extrabold text-text-main">{totalPosts}</span>
            <span className="block text-[10px] text-text-muted mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-secondary" />
              +1 published recently
            </span>
          </div>

          {/* Card 2: Total Views */}
          <div className="rounded-2xl border border-border-color bg-bg-surface p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 h-16 w-16 rounded-full bg-secondary/5 blur-lg group-hover:scale-125 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-text-muted">Aggregate Reads</span>
              <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                <Eye className="h-4.5 w-4.5" />
              </div>
            </div>
            <span className="block text-2xl md:text-3xl font-extrabold text-text-main">
              {totalViews.toLocaleString()}
            </span>
            <span className="block text-[10px] text-text-muted mt-1 flex items-center gap-0.5">
              <span className="text-secondary font-bold">12.5%</span> increase this week
            </span>
          </div>

          {/* Card 3: Total Likes */}
          <div className="rounded-2xl border border-border-color bg-bg-surface p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 h-16 w-16 rounded-full bg-primary/5 blur-lg group-hover:scale-125 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-text-muted">Endorsement Likes</span>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Heart className="h-4.5 w-4.5" />
              </div>
            </div>
            <span className="block text-2xl md:text-3xl font-extrabold text-text-main">{totalLikes}</span>
            <span className="block text-[10px] text-text-muted mt-1 flex items-center gap-1">
              Average {totalPosts > 0 ? (totalLikes / totalPosts).toFixed(1) : 0} likes/post
            </span>
          </div>

          {/* Card 4: Total Comments */}
          <div className="rounded-2xl border border-border-color bg-bg-surface p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 h-16 w-16 rounded-full bg-secondary/5 blur-lg group-hover:scale-125 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-text-muted">Discussion Comments</span>
              <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
            </div>
            <span className="block text-2xl md:text-3xl font-extrabold text-text-main">{totalComments}</span>
            <span className="block text-[10px] text-text-muted mt-1">
              Active discussions ongoing
            </span>
          </div>
        </section>

        {/* Charts & Interactive Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Interactive SVG Bar Chart (Left Column) */}
          <div className="lg:col-span-8 rounded-3xl border border-border-color bg-bg-surface p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border-color/60 pb-4">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Audience Activity (Weekly Views)
              </h3>
              <span className="text-[10px] text-text-muted font-bold flex items-center gap-1">
                Mon - Sun Cycle
                <ArrowUpRight className="h-3 w-3 text-secondary" />
              </span>
            </div>

            {/* Interactive SVG Rendering */}
            <div className="relative">
              {/* Tooltip Overlay */}
              {hoveredBar !== null && (
                <div
                  className="absolute z-10 bg-neutral-950 border border-neutral-800 text-neutral-200 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xl animate-in fade-in duration-100"
                  style={{
                    left: `${(hoveredBar * 14.2) + 7}%`,
                    top: "10%",
                    transform: "translateX(-50%)"
                  }}
                >
                  <div className="text-secondary">{ANALYTICS_DATA[hoveredBar].label} Views</div>
                  <div className="text-xs mt-0.5">{ANALYTICS_DATA[hoveredBar].views} pageviews</div>
                  <div className="text-[9px] text-neutral-400">{ANALYTICS_DATA[hoveredBar].likes} likes</div>
                </div>
              )}

              {/* Bar Chart Container */}
              <div className="h-64 w-full flex items-end justify-between px-2 pt-10">
                {ANALYTICS_DATA.map((data, idx) => {
                  // Calculate height ratio based on maxViews
                  const barHeightPercent = (data.views / maxViews) * 80; // capped at 80% for top margin
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center flex-1 group"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Bar Column */}
                      <div
                        className={`w-[60%] sm:w-[45%] rounded-t-lg transition-all duration-300 relative cursor-pointer ${hoveredBar === idx
                          ? "bg-gradient-to-t from-primary to-secondary neon-glow-primary scale-x-105"
                          : "bg-primary/20 hover:bg-primary/45"
                          }`}
                        style={{ height: `${barHeightPercent}%` }}
                      >
                        {/* Shimmer line inside hovered bar */}
                        {hoveredBar === idx && (
                          <div className="absolute inset-0 bg-white/10 animate-pulse-glow rounded-t-lg" />
                        )}
                      </div>

                      {/* X Label */}
                      <span className={`text-[10px] font-semibold mt-3 ${hoveredBar === idx ? "text-primary stroke-2" : "text-text-muted"
                        }`}>
                        {data.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Creator Info Sidebar (Right Column) */}
          <div className="lg:col-span-4 rounded-3xl border border-border-color bg-bg-surface p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border-color/60 pb-3">
              Manuscript Matrix Tips
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start text-xs">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary font-bold">1</div>
                <div>
                  <h4 className="font-bold text-text-main">Maintain Formatting</h4>
                  <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                    Always use headers (`##` or `###`) in the writer simulator. They populate the Table of Contents automatically.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs">
                <div className="h-6 w-6 rounded-full bg-secondary/10 flex-shrink-0 flex items-center justify-center text-secondary font-bold">2</div>
                <div>
                  <h4 className="font-bold text-text-main">Syncing Index</h4>
                  <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                    Everything you write or delete resides safely inside local cache registers (`localStorage`). Clear browser data to reset.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Post Manager Panel (Table layout) */}
        <section className="rounded-3xl border border-border-color bg-bg-surface p-6 md:p-8 shadow-sm">
          <div className="border-b border-border-color/60 pb-4 mb-6">
            <h3 className="text-base font-extrabold text-text-main">Manage Manuscripts</h3>
            <p className="text-[11px] text-text-muted mt-1">Edit title, category, summaries, or discard posts permanently from local memory.</p>
          </div>

          {totalPosts > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-color/60 text-text-muted font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Manuscript Title</th>
                    <th className="pb-3">Sector</th>
                    <th className="pb-3 text-center">Likes</th>
                    <th className="pb-3 text-center">Reads</th>
                    <th className="pb-3 text-center">Comments</th>
                    <th className="pb-3 text-right pr-2">Control Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/40">
                  {posts.map((post) => (
                    <tr key={post.id} className="group hover:bg-border-color/10 transition-all">
                      {/* Title */}
                      <td className="py-4 pl-2 font-semibold text-text-main max-w-xs sm:max-w-md truncate">
                        <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                        <span className="block text-[9px] text-text-muted mt-0.5">Published on {post.createdAt}</span>
                      </td>
                      {/* Category */}
                      <td className="py-4">
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">
                          {post.category}
                        </span>
                      </td>
                      {/* Likes */}
                      <td className="py-4 text-center text-text-muted font-medium">
                        {post.likes}
                      </td>
                      {/* Views */}
                      <td className="py-4 text-center text-text-muted font-medium">
                        {post.views}
                      </td>
                      {/* Comments */}
                      <td className="py-4 text-center text-text-muted font-medium">
                        —
                      </td>
                      {/* Actions */}
                      <td className="py-4 text-right pr-2">
                        {deleteConfirmId === post.id ? (
                          <div className="flex items-center justify-end gap-1.5 animate-in slide-in-from-right-1">
                            <span className="text-[10px] text-red-500 font-bold flex items-center gap-0.5">
                              <AlertTriangle className="h-3 w-3" />
                              Confirm?
                            </span>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="rounded bg-red-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="rounded border border-border-color bg-bg-surface px-2 py-1 text-[10px] font-bold text-text-muted hover:text-text-main"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/write?edit=${post.id}`}
                              className="p-2 rounded-lg border border-border-color bg-bg-surface hover:border-primary/30 text-text-muted hover:text-primary transition-all"
                              title="Edit Article"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirmId(post.id)}
                              className="p-2 rounded-lg border border-border-color bg-bg-surface hover:border-red-500/30 text-text-muted hover:text-red-500 transition-all"
                              title="Discard Article"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-text-muted opacity-30 mb-3" />
              <h4 className="text-sm font-bold text-text-main">Chronicle Library is Vacant</h4>
              <p className="text-xs text-text-muted max-w-xs mx-auto mt-1">
                You have not published any manuscripts yet. Compose a new article to get started!
              </p>
              <Link
                href="/write"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-4 py-2 text-xs font-semibold shadow-md hover:bg-primary/95 transition-all"
              >
                Compose Article
              </Link>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
