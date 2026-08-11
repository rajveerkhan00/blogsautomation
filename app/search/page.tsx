"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useBlogs } from "@/lib/hooks/useBlogs";
import { 
  Search as SearchIcon, SlidersHorizontal, BookOpen, Clock, Heart, 
  Calendar, Eye, RefreshCw, ChevronDown 
} from "../components/icons";

// Inner component to access search params inside Suspense
function SearchContent() {
  const searchParams = useSearchParams();
  const { blogs: posts, isLoading } = useBlogs({ limit: 100 });
  const isLoaded = !isLoading;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const urlTag = searchParams.get("tag");
    const urlQuery = searchParams.get("q");
    if (urlTag) {
      setSelectedTag(urlTag);
      setShowFilters(true);
    }
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  if (!isLoaded) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-text-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="mt-3 text-xs">Loading search directory...</span>
      </div>
    );
  }

  const categories = ["All", "Tech", "Sports", "Movies", "Health"];
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags)));

  const filteredPosts = posts.filter(post => {
    const matchesKeyword = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesTag = selectedTag === "" || post.tags.includes(selectedTag);

    return matchesKeyword && matchesCategory && matchesTag;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "popular") return b.views - a.views;
    if (sortBy === "liked") return b.likes - a.likes;
    return 0;
  });

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedTag("");
    setSortBy("newest");
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-10">
      {/* Filters Overlay Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border-color/60 pb-6">
        <div className="relative w-full sm:max-w-md">
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, tags, content..."
            className="w-full rounded-2xl border border-border-color bg-bg-surface py-3 pl-11 pr-4 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 placeholder:text-text-muted transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              showFilters 
                ? "border-primary/30 bg-primary/10 text-primary" 
                : "border-border-color bg-bg-surface hover:text-primary"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Parameters</span>
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-xl border border-border-color bg-bg-surface py-2.5 pl-4 pr-10 text-xs font-semibold text-text-main outline-none cursor-pointer hover:border-primary/20 transition-all focus:border-primary"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="popular">Sort: Popular</option>
              <option value="liked">Sort: Liked</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Expanded Filters Drawer */}
      {showFilters && (
        <div className="rounded-2xl border border-border-color bg-bg-surface p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <div>
            <h4 className="text-xs font-black uppercase text-text-muted mb-3" style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-primary text-white"
                      : "border border-border-color text-text-muted hover:text-text-main bg-bg-base/30"
                  }`}
                  style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {allTags.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase text-text-muted mb-3" style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>Tags</h4>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all cursor-pointer ${
                      selectedTag === tag
                        ? "bg-secondary text-white"
                        : "border border-border-color text-text-muted hover:text-text-main bg-bg-base/30"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-text-muted hover:text-primary transition-colors cursor-pointer"
            >
              Reset Parameters
            </button>
          </div>
        </div>
      )}

      {/* Search Stats */}
      <div className="flex items-center justify-between text-xs text-text-muted font-semibold px-1">
        <span>Displaying {sortedPosts.length} matches of {posts.length} articles</span>
        {selectedTag && (
          <span className="flex items-center gap-1.5 bg-secondary/15 text-secondary px-2.5 py-1 rounded-full text-[10px] font-bold">
            Tag: #{selectedTag}
            <button onClick={() => setSelectedTag("")} className="hover:text-red-500 font-extrabold ml-1">×</button>
          </span>
        )}
      </div>

      {/* Grid of Results */}
      {sortedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedPosts.map((post) => (
            <article 
              key={post._id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl glass-panel neon-glow-hover transition-all duration-300 border border-border-color"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-w-md) 100vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-bg-surface/90 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold text-primary uppercase border border-border-color z-10">
                  {post.category}
                </span>
                <div className="absolute inset-0 bg-neutral-950/10 mix-blend-multiply" />
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[9px] text-text-muted mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.createdAt)}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-base font-bold text-text-main group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                </div>

                {/* Footer metrics */}
                <div className="flex items-center justify-between pt-4 border-t border-border-color mt-auto">
                  <span className="text-[10px] font-medium text-text-main truncate max-w-[150px]">
                    {post.author}
                  </span>

                  <div className="flex items-center gap-2.5 text-text-muted text-[10px]">
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-3.5 w-3.5" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3.5 w-3.5" />
                      {post.views}
                    </span>
                  </div>
                </div>

              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border-color bg-bg-surface py-20 px-8 text-center max-w-md mx-auto glass-panel">
          <BookOpen className="mx-auto h-16 w-16 text-text-muted opacity-30 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-text-main">No Archives Match</h3>
          <p className="mt-2 text-sm text-text-muted leading-relaxed">
            We could not find any manuscripts matching your search terms: <span className="font-semibold text-text-main">"{searchQuery || selectedTag}"</span>.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-5 py-2.5 text-xs font-semibold shadow-md hover:bg-primary/95 transition-all cursor-pointer"
          >
            Clear All Parameters
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl p-8 md:p-14 mb-10 glass-panel grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-border-color">
          {/* Ambient Lighting Backgrounds */}
          <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-breathe" />
          <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none animate-breathe" />

          <div className="md:col-span-8 relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3.5 py-1 text-xs font-bold text-primary mb-5 uppercase tracking-widest"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
              Search Console
            </span>
            <h1
              className="text-5xl md:text-7xl leading-none mb-5 uppercase"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient">
                Archive
              </span>
              <br />
              <span className="text-text-main">Explorer.</span>
            </h1>
            <p className="text-sm md:text-base text-text-muted leading-relaxed mb-4 max-w-lg">
              Traverse our archives. Search keywords, toggle categories, and order parameters to find custom guides.
            </p>
          </div>

          {/* Right Column: Dynamic Spinning Radar SVG Emblem */}
          <div className="hidden md:block md:col-span-4 relative z-10 justify-self-center">
            <svg 
              className="h-44 w-44 animate-float text-primary drop-shadow-[0_0_16px_var(--primary)]" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
              <circle cx="50" cy="50" r="26" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
              <line x1="50" y1="50" x2="78" y2="22" stroke="var(--secondary)" strokeWidth="3" strokeLinecap="round" className="origin-[50px_50px] animate-[spin_5s_linear_infinite]" />
              <circle cx="78" cy="22" r="4" fill="var(--secondary)" />
              <circle cx="32" cy="68" r="3" fill="currentColor" opacity="0.8" />
              <circle cx="50" cy="50" r="5" fill="var(--primary)" />
            </svg>
          </div>
        </section>

        {/* Suspense Wrapper is MANDATORY for searchParams usage */}
        <Suspense 
          fallback={
            <div className="flex h-[300px] flex-col items-center justify-center text-text-muted">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="mt-3 text-xs">Aligning radar grids...</span>
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
