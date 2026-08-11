"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBlogs, type BlogPost } from "@/lib/hooks/useBlogs";
import { Clock, Heart, Eye, Bookmark } from "@/app/components/icons";

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

function SkeletonCard() {
  return (
    <div className="rounded-2xl glass-panel overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-bg-surface/60" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 rounded bg-bg-surface/60" />
        <div className="h-4 w-full rounded bg-bg-surface/60" />
        <div className="h-4 w-3/4 rounded bg-bg-surface/60" />
        <div className="h-3 w-full rounded bg-bg-surface/60" />
      </div>
    </div>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="flex flex-col overflow-hidden rounded-2xl glass-panel neon-glow-hover transition-all duration-300 cursor-pointer h-full">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.coverImage || FALLBACK_IMAGE}
            alt={post.title}
            fill sizes="30vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 rounded-full bg-bg-surface/90 backdrop-blur-sm px-2.5 py-0.5 text-[9px] font-black text-primary uppercase tracking-widest border border-border-color z-10"
            style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
            {post.category}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBookmarked(!bookmarked); }}
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
            <h3 className="text-base uppercase leading-tight text-text-main group-hover:text-primary transition-colors line-clamp-2 mb-2"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
              {post.title}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border-color">
            <span className="text-[10px] font-semibold text-text-main truncate max-w-[120px]">{post.author}</span>
            <div className="flex items-center gap-2.5 text-[10px] text-text-muted">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
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
    </Link>
  );
}


interface CategoryPageProps {
  category: "Tech" | "Movies" | "Health" | "Sports";
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroSvg: React.ReactNode;
}

export function CategoryPageContent({
  category,
  heroLabel,
  heroTitle,
  heroSubtitle,
  heroDescription,
  heroSvg,
}: CategoryPageProps) {
  const { blogs, isLoading, error } = useBlogs({ category, limit: 20 });

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl p-8 md:p-14 mb-16 glass-panel grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-border-color">
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-breathe" />
        <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none animate-breathe" />

        <div className="md:col-span-8 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3.5 py-1 text-xs font-bold text-primary mb-5 uppercase tracking-widest"
            style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
            {heroLabel}
          </span>
          <h1 className="text-5xl md:text-7xl leading-none mb-5 uppercase"
            style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient">
              {heroTitle}
            </span>
            <br />
            <span className="text-text-main">{heroSubtitle}</span>
          </h1>
          <p className="text-sm md:text-base text-text-muted leading-relaxed mb-4 max-w-lg">
            {heroDescription}
          </p>
        </div>

        <div className="hidden md:block md:col-span-4 relative z-10 justify-self-center">
          {heroSvg}
        </div>
      </section>

      {/* ── SECTION HEADER ───────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 border-b border-border-color pb-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2"
          style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
          <span className="h-1.5 w-6 rounded-full bg-primary inline-block" />
          {category} Articles
          {!isLoading && <span className="text-primary ml-1">({blogs.length})</span>}
        </p>
        <Link href="/search"
          className="text-xs text-text-muted hover:text-primary transition-colors">
          Search All →
        </Link>
      </div>

      {/* ── POSTS GRID ───────────────────────────────────── */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center mb-8">
          <p className="text-red-400 text-sm">Failed to load blogs.</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(post => <BlogCard key={post._id} post={post} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-color bg-bg-surface p-16 text-center glass-panel">
          <p className="text-xl font-black uppercase text-text-muted mb-2"
            style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
            First {category} article generating...
          </p>
          <p className="text-sm text-text-muted">New articles are auto-generated every 24 hours.</p>
        </div>
      )}
    </main>
  );
}
