"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  Heart, Bookmark, Calendar, Clock, 
  ArrowLeft, ThumbsUp, Check, Copy, AlertCircle
} from "../../components/icons";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  category: "Tech" | "Movies" | "Health" | "Sports";
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  metaDescription: string;
  readTime: string;
  views: number;
  likes: number;
  author: string;
  createdAt: string;
}

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

export default function BlogPostDetail({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.id;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);

  // 1. Fetch live article data
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/blogs/${slug}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Manuscript not found");
          throw new Error(`HTTP Error ${res.status}`);
        }
        return res.json();
      })
      .then((data: { blog: BlogPost }) => {
        setPost(data.blog);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  // 2. Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Build Table of Contents from HTML Content
  useEffect(() => {
    if (post && post.content) {
      // Find headers (h2/h3) from raw HTML content
      const headersList: { id: string; text: string; level: number }[] = [];
      const parser = new RegExp(/<h(2|3)[^>]*>(.*?)<\/h\1>/gi);
      let match;
      
      while ((match = parser.exec(post.content)) !== null) {
        const level = parseInt(match[1], 10);
        const rawText = match[2].replace(/<[^>]*>/g, ""); // Strip any nested tags
        const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        headersList.push({ id, text: rawText, level });
      }
      
      setToc(headersList);
    }
  }, [post]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Add IDs to headers dynamically in HTML content for Table of Contents anchors
  const getProcessedContent = () => {
    if (!post || !post.content) return "";
    let processed = post.content;
    
    // Replace <h2>Text</h2> with <h2 id="text">Text</h2>
    processed = processed.replace(/<h2>(.*?)<\/h2>/gi, (_, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `<h2 id="${id}" class="text-xl md:text-2xl font-bold tracking-tight text-text-main mt-8 mb-4 border-b border-border-color/60 pb-2 scroll-mt-20">${text}</h2>`;
    });

    // Replace <h3>Text</h3> with <h3 id="text">Text</h3>
    processed = processed.replace(/<h3>(.*?)<\/h3>/gi, (_, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `<h3 id="${id}" class="text-lg md:text-xl font-bold tracking-tight text-text-main mt-6 mb-3 scroll-mt-20">${text}</h3>`;
    });

    // Apply classes for lists, paragraph spacing, and links
    processed = processed.replace(/<p>/gi, '<p class="text-sm md:text-base text-text-muted leading-relaxed mb-4">');
    processed = processed.replace(/<ul[^>]*>/gi, '<ul class="list-disc pl-6 space-y-2 mb-6 text-sm md:text-base leading-relaxed text-text-muted">');
    processed = processed.replace(/<ol[^>]*>/gi, '<ol class="list-decimal pl-6 space-y-2 mb-6 text-sm md:text-base leading-relaxed text-text-muted">');
    processed = processed.replace(/<blockquote[^>]*>/gi, '<blockquote class="border-l-4 border-primary bg-primary/5 pl-4 py-3 pr-2 rounded-r-xl italic text-text-muted text-sm md:text-base leading-relaxed mb-6">');
    processed = processed.replace(/<a /gi, '<a class="text-primary hover:underline font-medium" ');

    return processed;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-bg-base">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-text-muted mt-3">Loading manuscript...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen flex-col bg-bg-base">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-primary mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-text-main" style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
            Manuscript Missing
          </h1>
          <p className="text-sm text-text-muted mt-2 mb-6">
            {error || "We are unable to locate the requested blog post."}
          </p>
          <Link href="/" className="rounded-xl bg-primary text-white px-5 py-2.5 text-xs font-semibold shadow-md hover:bg-primary/95 transition-all">
            Return to Feed
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-base transition-colors duration-300 relative">
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 z-50 h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-100" 
        style={{ width: `${scrollProgress}%` }}
      />

      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-primary transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Home Feed
          </Link>
        </div>

        {/* Header Section */}
        <header className="max-w-3xl mx-auto mb-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider mb-4">
            {post.category}
          </span>
          <h1 
            className="text-4xl md:text-6xl uppercase tracking-tight text-text-main leading-tight mb-4"
            style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
          >
            {post.title}
          </h1>
          <p className="text-base text-text-muted leading-relaxed mb-6">
            {post.excerpt}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-b border-border-color/60 py-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-text-main">{post.author}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-border-color aspect-[21/9] relative mb-12 shadow-md">
          <Image
            src={post.coverImage || FALLBACK_IMAGE}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
          <div className="lg:col-span-8">
            <article 
              className="prose dark:prose-invert max-w-none text-text-main leading-relaxed"
              dangerouslySetInnerHTML={{ __html: getProcessedContent() }}
            />

            {/* Interaction Bar */}
            <div className="border-t border-b border-border-color/60 py-4 my-10 flex items-center justify-between text-text-muted">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 text-sm font-semibold transition-all hover:text-primary ${
                    liked ? "text-primary scale-105" : ""
                  }`}
                >
                  <ThumbsUp className={`h-5 w-5 ${liked ? "fill-primary text-primary" : ""}`} />
                  <span>{liked ? post.likes + 1 : post.likes} Likes</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`p-2 rounded-xl border border-border-color bg-bg-surface/50 hover:text-primary hover:border-primary/20 transition-all ${
                    bookmarked ? "text-primary bg-primary/10 border-primary/20" : ""
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-primary" : ""}`} />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-border-color bg-bg-surface/50 hover:text-primary hover:border-primary/20 transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-secondary" />
                      <span className="text-secondary">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Table of Contents / Sidebar */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
            {toc.length > 0 && (
              <div className="rounded-2xl p-6 glass-panel border border-border-color">
                <h3 
                  className="text-xs font-black uppercase tracking-widest text-text-muted mb-4"
                  style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
                >
                  Table of Contents
                </h3>
                <nav className="space-y-3">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-xs text-text-muted hover:text-primary transition-all duration-200 ${
                        item.level === 3 ? "pl-4 opacity-80" : "font-bold"
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Platform Card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 rounded-2xl transition-all duration-300 group-hover:scale-105" />
              <h3 
                className="text-lg uppercase font-black leading-tight"
                style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
              >
                ParagonSoft Blogs
              </h3>
              <p className="text-[11px] text-white/80 leading-relaxed mt-2 mb-4">
                Fresh daily articles covering the cutting edge of tech, sport tactics, cinema reviews, and wellness habits.
              </p>
              <Link 
                href="/" 
                className="inline-flex items-center rounded-xl bg-white text-primary px-4 py-2 text-xs font-black hover:bg-white/95 transition-all shadow-md"
                style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
              >
                Back to Feed
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
