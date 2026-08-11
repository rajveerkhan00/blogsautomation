"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useBlogs, type BlogPost } from "@/lib/hooks/useBlogs";
import { Clock, Heart, Eye, Bookmark, Tag } from "./components/icons";

const CATEGORIES = ["All", "Tech", "Sports", "Movies", "Health"] as const;
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80";

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({ post }: { post: BlogPost }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl glass-panel neon-glow-hover transition-all duration-300">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.coverImage || FALLBACK_IMAGE}
          alt={post.title}
          fill
          sizes="30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-bg-surface/90 backdrop-blur-sm px-2.5 py-0.5 text-[9px] font-black text-primary uppercase tracking-widest border border-border-color z-10"
          style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
          {post.category}
        </span>
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-bg-surface/90 border border-border-color text-text-muted hover:text-primary transition-all z-10"
        >
          <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-primary text-primary" : ""}`} />
        </button>
        <div className="absolute inset-0 bg-neutral-950/10 mix-blend-multiply" />
      </div>
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] text-text-muted mb-2">
            <Clock className="h-3 w-3" />{post.readTime}<span>·</span>{formatDate(post.createdAt)}
          </div>
          <Link href={`/blog/${post.slug}`}>
            <h3 className="text-base uppercase leading-tight text-text-main group-hover:text-primary transition-colors line-clamp-2 mb-2"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
              {post.title}
            </h3>
          </Link>
          <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border-color">
          <span className="text-[10px] font-semibold text-text-main truncate max-w-[120px]">{post.author}</span>
          <div className="flex items-center gap-2.5 text-[10px] text-text-muted">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1 hover:text-primary transition-all ${liked ? "text-primary" : ""}`}
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-primary" : ""}`} />
              {liked ? post.likes + 1 : post.likes}
            </button>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{post.views.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Featured Card ─────────────────────────────────────────────────────────────
function FeaturedCard({ post }: { post: BlogPost }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl glass-panel neon-glow-hover transition-all duration-300 min-h-[380px]">
      <div className="relative col-span-1 lg:col-span-7 min-h-[220px] overflow-hidden">
        <Image
          src={post.coverImage || FALLBACK_IMAGE}
          alt={post.title}
          fill sizes="70vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1 text-xs font-black uppercase tracking-widest text-white z-10"
          style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
          {post.category}
        </span>
        <div className="absolute inset-0 bg-neutral-950/20 mix-blend-multiply" />
      </div>
      <div className="col-span-1 lg:col-span-5 p-7 md:p-10 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-text-muted mb-3">
            <Clock className="h-3.5 w-3.5" />{post.readTime}
            <span>·</span>{formatDate(post.createdAt)}
          </div>
          <Link href={`/blog/${post.slug}`}>
            <h2 className="text-2xl md:text-3xl uppercase leading-tight text-text-main hover:text-primary transition-colors mb-3 line-clamp-3"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
              {post.title}
            </h2>
          </Link>
          <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-6">{post.excerpt}</p>
        </div>
        <div className="flex items-center justify-between border-t border-border-color pt-4">
          <span className="text-xs font-semibold text-text-main">{post.author}</span>
          <div className="flex items-center gap-3 text-text-muted text-xs">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1 hover:text-primary transition-all ${liked ? "text-primary" : ""}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-primary" : ""}`} />
              {liked ? post.likes + 1 : post.likes}
            </button>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{post.views.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl glass-panel overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-bg-surface/60" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 rounded bg-bg-surface/60" />
        <div className="h-4 w-full rounded bg-bg-surface/60" />
        <div className="h-4 w-3/4 rounded bg-bg-surface/60" />
        <div className="h-3 w-full rounded bg-bg-surface/60" />
        <div className="h-3 w-2/3 rounded bg-bg-surface/60" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Fetch all blogs (or filtered by category)
  const { blogs, isLoading, error } = useBlogs({
    category: activeCategory === "All" ? undefined : activeCategory,
    limit: 20,
  });

  // Trending: top 3 by views (from all blogs)
  const { blogs: trendingBlogs } = useBlogs({ limit: 3, sort: "popular" });
  const allTags = Array.from(new Set(blogs.flatMap((p) => p.tags))).slice(0, 12);

  const featured = activeCategory === "All" ? blogs[0] : undefined;
  const grid = activeCategory === "All" ? blogs.slice(1) : blogs;

  return (
    <div className="flex min-h-screen flex-col bg-bg-base theme-transition">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl p-8 md:p-14 mb-16 glass-panel grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-border-color">
          <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-breathe" />
          <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none animate-breathe" />

          <div className="md:col-span-8 relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3.5 py-1 text-xs font-bold text-primary mb-5 uppercase tracking-widest"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
              ParagonSoft Blogs
            </span>

            <h1 className="text-5xl md:text-7xl leading-none mb-5 uppercase"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient">
                Read What
              </span>
              <br />
              <span className="text-text-main">Matters Most.</span>
            </h1>

            <p className="text-sm md:text-base text-text-muted leading-relaxed mb-8 max-w-lg">
              AI-curated articles across Technology, Sports, Cinema, and Health — fresh content every 24 hours.
            </p>

            <div className="flex flex-wrap gap-3">
              {CATEGORIES.slice(1).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-primary text-white shadow-lg scale-105"
                      : "border border-border-color text-text-muted hover:border-primary/50 hover:text-primary bg-bg-surface/50"
                  }`}
                  style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", letterSpacing: "0.05em" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block md:col-span-4 relative z-10 justify-self-center">
            <svg className="h-40 w-40 animate-float text-primary drop-shadow-[0_0_15px_var(--primary)]"
              viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              <circle cx="50" cy="50" r="30" stroke="var(--secondary)" strokeWidth="3" />
              <path d="M50 10 L90 50 L50 90 L10 50 Z" stroke="currentColor" strokeWidth="2" />
              <path d="M50 20 L80 50 L50 80 L20 50 Z" stroke="var(--secondary)" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="5" fill="var(--primary)" />
            </svg>
          </div>
        </section>

        {/* ── FEATURED POST ─────────────────────────────────── */}
        {activeCategory === "All" && featured && (
          <section className="mb-16">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
              <span className="h-1.5 w-6 rounded-full bg-primary inline-block" /> Featured Story
            </p>
            <FeaturedCard post={featured} />
          </section>
        )}

        {/* ── GRID + SIDEBAR ─────────────────────────────────── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-border-color pb-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
              <span className="h-1.5 w-6 rounded-full bg-secondary inline-block" />
              {activeCategory === "All" ? "Latest Articles" : `${activeCategory} Articles`}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-primary text-white shadow-md"
                      : "bg-bg-surface border border-border-color text-text-muted hover:text-text-main"
                  }`}
                  style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Posts Grid */}
            <div className="lg:col-span-8">
              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                  <p className="text-red-400 text-sm">Failed to load blogs. Is the server running?</p>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : grid.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {grid.map(post => <BlogCard key={post._id} post={post} />)}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border-color bg-bg-surface p-12 text-center glass-panel">
                  <p className="text-xl font-black uppercase text-text-muted mb-2"
                    style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
                    {blogs.length === 0 ? "Generating first blogs..." : "No articles in this category yet"}
                  </p>
                  <p className="text-sm text-text-muted mb-4">
                    {blogs.length === 0
                      ? "The AI is writing your first batch of articles. Check back in a moment!"
                      : "New articles are added every 24 hours."}
                  </p>
                  <button onClick={() => setActiveCategory("All")} className="mt-2 text-xs text-primary font-semibold hover:underline cursor-pointer">
                    View All Articles
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">

              {/* Trending */}
              <div className="rounded-2xl p-6 glass-panel shadow-sm border border-border-color">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-5"
                  style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
                  🔥 Trending Now
                </h3>
                {trendingBlogs.length > 0 ? (
                  <div className="space-y-4">
                    {trendingBlogs.map((post, idx) => (
                      <div key={post._id} className="flex gap-3 group">
                        <span className="text-2xl font-black text-primary/20 group-hover:text-primary transition-colors leading-none font-mono">0{idx + 1}</span>
                        <div>
                          <Link href={`/blog/${post.slug}`}>
                            <h4 className="text-xs font-black uppercase text-text-main hover:text-primary transition-colors leading-snug line-clamp-2"
                              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
                              {post.title}
                            </h4>
                          </Link>
                          <span className="text-[9px] text-text-muted">{post.category} · {post.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">Articles coming soon...</p>
                )}
              </div>

              {/* Tags Cloud */}
              {allTags.length > 0 && (
                <div className="rounded-2xl p-6 glass-panel shadow-sm border border-border-color">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2"
                    style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
                    <Tag className="h-4 w-4 text-secondary" /> Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map(tag => (
                      <Link
                        key={tag}
                        href={`/search?tag=${encodeURIComponent(tag)}`}
                        className="rounded-lg border border-border-color bg-bg-base/70 px-2.5 py-1 text-[10px] font-bold text-text-muted hover:text-primary hover:border-primary/20 transition-all hover:scale-105"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* About Teaser */}
              <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 rounded-2xl transition-all duration-300 group-hover:scale-105" />
                <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <h3 className="text-lg uppercase font-black leading-tight relative z-10"
                  style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
                  About ParagonSoft Blogs
                </h3>
                <p className="text-[11px] text-white/80 leading-relaxed mt-2 mb-4 relative z-10">
                  AI-powered, expert-curated stories on tech, sports, cinema, and wellness — fresh every 24 hours.
                </p>
                <Link href="/about"
                  className="inline-flex items-center rounded-xl bg-white text-primary px-4 py-2 text-xs font-black hover:bg-white/95 transition-all relative z-10 hover:scale-105 shadow-md"
                  style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
                  Our Story →
                </Link>
              </div>

            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
