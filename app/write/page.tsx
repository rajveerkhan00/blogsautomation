"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useBlog } from "../context/BlogContext";
import { 
  PenSquare, Eye, Sparkles, Check, AlertTriangle, Clock 
} from "../components/icons";

const COVER_PRESETS = [
  { name: "Coding Matrix", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600" },
  { name: "UX Design Studio", url: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=600" },
  { name: "Cozy Writer Desk", url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600" },
  { name: "Arctic Aurora", url: "https://images.unsplash.com/photo-1520262454473-a1a82276a574?auto=format&fit=crop&q=80&w=600" },
  { name: "Modern Architecture", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600" },
];

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { posts, isLoaded } = useBlog();
  const createPost = (payload: any) => {
    console.log("Mock createPost:", payload);
    return payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  };
  const updatePost = (id: string, payload: any) => {
    console.log("Mock updatePost:", id, payload);
  };

  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  // Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Tech" | "Movies" | "Health" | "Sports">("Tech");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [readTime, setReadTime] = useState("5 min read");
  
  // Feedback states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit"); // for mobile view toggle

  // Load post details if editing
  useEffect(() => {
    if (isEditing && isLoaded) {
      const existingPost = posts.find(p => p.id === editId);
      if (existingPost) {
        setTitle(existingPost.title);
        setCategory(existingPost.category);
        setSummary(existingPost.summary);
        setContent(existingPost.content);
        setTags(existingPost.tags.join(", "));
        setCoverImage(existingPost.coverImage);
        setReadTime(existingPost.readTime);
      } else {
        setError("The post selected for editing could not be found.");
      }
    }
  }, [editId, isEditing, isLoaded, posts]);

  if (!isLoaded) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-text-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="mt-3 text-xs">Calibrating drafting boards...</span>
      </div>
    );
  }

  // Handle Publish Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Article Title is required.");
      return;
    }
    if (!summary.trim()) {
      setError("Article Summary is required.");
      return;
    }
    if (!content.trim()) {
      setError("Article Markdown Body Content is required.");
      return;
    }
    setError("");

    const parsedTags = tags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const postPayload = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category,
      tags: parsedTags.length > 0 ? parsedTags : ["General"],
      coverImage,
      readTime: readTime.trim() || "5 min read",
      author: {
        name: "Chronicle Guest",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        role: "Contributing Writer"
      }
    };

    setSuccess(true);

    setTimeout(() => {
      let finalSlug = "";
      if (isEditing && editId) {
        updatePost(editId, postPayload);
        finalSlug = editId;
      } else {
        finalSlug = createPost(postPayload);
      }
      setSuccess(false);
      router.push(`/blog/${finalSlug}`);
    }, 1500);
  };

  // Live Inline Markdown Parser for Preview Box
  const renderPreviewMarkdown = (text: string) => {
    if (!text) {
      return <p className="text-text-muted italic text-sm">Write something in the editor to see your draft render live...</p>;
    }

    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeLines: string[] = [];
    let inList = false;
    let listItems: string[] = [];

    const flushList = (key: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-6 space-y-1.5 mb-4 text-xs md:text-sm text-text-muted leading-relaxed">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: parseInlineStyles(item) }} />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const parseInlineStyles = (txt: string) => {
      let formatted = txt.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-text-main">$1</strong>');
      formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
      formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-bg-base border border-border-color px-1 rounded text-primary font-mono text-[0.85em]">$1</code>');
      return formatted;
    };

    lines.forEach((line, idx) => {
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          const codeString = codeLines.join("\n");
          elements.push(
            <div key={`code-${idx}`} className="rounded-xl border border-border-color bg-neutral-950 p-4 mb-4 font-mono text-[11px] md:text-xs text-neutral-200 shadow-inner relative">
              <div className="absolute top-1.5 right-2 text-[9px] uppercase font-bold text-neutral-500">{codeLanguage}</div>
              <pre className="overflow-x-auto"><code>{codeString}</code></pre>
            </div>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          flushList(idx);
          inCodeBlock = true;
          codeLanguage = line.trim().replace("```", "").toLowerCase();
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      if (line.trim().startsWith("- ")) {
        inList = true;
        listItems.push(line.trim().substring(2));
        return;
      } else {
        if (inList) {
          flushList(idx);
        }
      }

      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={idx} className="text-base md:text-lg font-bold text-text-main mt-5 mb-2.5 border-b border-border-color/60 pb-1">
            {line.replace("## ", "").trim()}
          </h2>
        );
        return;
      }

      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={idx} className="text-sm md:text-base font-bold text-text-main mt-4 mb-2">
            {line.replace("### ", "").trim()}
          </h3>
        );
        return;
      }

      if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={idx} className="border-l-4 border-primary bg-primary/5 pl-3 py-2 pr-1 rounded-r-lg italic text-text-muted text-xs md:text-sm mb-4 leading-relaxed">
            <p dangerouslySetInnerHTML={{ __html: parseInlineStyles(line.substring(2).trim()) }} />
          </blockquote>
        );
        return;
      }

      if (line.trim() === "") {
        elements.push(<div key={idx} className="h-3" />);
        return;
      }

      elements.push(
        <p key={idx} className="text-xs md:text-sm text-text-muted leading-relaxed mb-3.5" dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }} />
      );
    });

    if (inList) {
      flushList(lines.length);
    }

    return elements;
  };

  const parsedTagsPreview = tags.split(",").map(t => t.trim()).filter(t => t.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: Input form editor */}
      <div className={`lg:col-span-6 space-y-6 ${activeTab === "preview" ? "hidden lg:block" : "block"}`}>
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border-color bg-bg-surface p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border-color/60 pb-4">
            <h2 className="text-lg font-extrabold text-text-main flex items-center gap-2">
              <PenSquare className="h-5 w-5 text-primary animate-pulse" />
              {isEditing ? "Modify Manuscript" : "Draft New Chronicle"}
            </h2>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">
              {category} Section
            </span>
          </div>

          {/* Form Error Feedback */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-500 font-semibold flex items-center gap-2 animate-in slide-in-from-top-1">
              <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-text-main uppercase tracking-wider">Article Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Navigating Web Animations in 2026..."
              className="w-full rounded-xl border border-border-color bg-bg-base p-3 text-xs text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
            />
          </div>

          {/* Category, Read Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-main uppercase tracking-wider">Category Sector</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-border-color bg-bg-base p-3 text-xs text-text-main outline-none focus:border-primary"
              >
                <option value="Tech">Tech Frequency</option>
                <option value="Movies">Movies Section</option>
                <option value="Health">Health Guide</option>
                <option value="Sports">Sports Arena</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-main uppercase tracking-wider">Read Duration</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 5 min read"
                className="w-full rounded-xl border border-border-color bg-bg-base p-3 text-xs text-text-main outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Cover Presets Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-main uppercase tracking-wider">Select Preset Cover Image</label>
            <div className="grid grid-cols-5 gap-2">
              {COVER_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCoverImage(preset.url)}
                  className={`relative aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all ${
                    coverImage === preset.url ? "border-primary scale-105 shadow-sm" : "border-transparent opacity-65 hover:opacity-100"
                  }`}
                  title={preset.name}
                >
                  <Image
                    src={preset.url}
                    alt={preset.name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
            
            {/* Custom Cover Input */}
            <div className="space-y-1 mt-2">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Or paste customized Unsplash image URL..."
                className="w-full rounded-xl border border-border-color bg-bg-base p-2.5 text-[11px] text-text-muted outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Summary Excerpt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-text-main uppercase tracking-wider">Brief Summary Excerpt</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide a concise description summarizing this article's focal points (Max 200 chars)..."
              rows={2}
              maxLength={220}
              className="w-full rounded-xl border border-border-color bg-bg-base p-3 text-xs text-text-main outline-none focus:border-primary"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-text-main uppercase tracking-wider">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Nextjs, Tailwind, Coding, CSS"
              className="w-full rounded-xl border border-border-color bg-bg-base p-3 text-xs text-text-main outline-none focus:border-primary"
            />
          </div>

          {/* Body Markdown Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-text-main uppercase tracking-wider">Simulated Markdown Body</label>
              <span className="text-[10px] text-text-muted font-medium font-mono">
                Support: ## Header | &gt; Quote | - List | ```Code
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Write content using standard inline tags. For example:
              
## Heading Title Here
This is a standard paragraph showing **bold** text and \`inline code\`.

> An elegant blockquote structure details styling philosophies.

- Bullet item one
- Bullet item two

\`\`\`javascript
const testVal = "Hello Chronicle";
console.log(testVal);
\`\`\``}
              rows={12}
              className="w-full rounded-xl border border-border-color bg-bg-base p-3 font-mono text-[11px] leading-relaxed text-text-main outline-none focus:border-primary"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-color/60">
            <Link
              href={isEditing ? `/blog/${editId}` : "/"}
              className="rounded-xl border border-border-color bg-bg-surface hover:bg-border-color/20 text-text-main text-xs font-bold px-5 py-2.5"
            >
              Cancel Draft
            </Link>
            <button
              type="submit"
              disabled={success}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white text-xs font-bold px-6 py-2.5 shadow-md hover:bg-primary/95 transition-all hover:scale-105 active:scale-98 cursor-pointer ${
                success ? "bg-secondary hover:bg-secondary" : ""
              }`}
            >
              {success ? (
                <>
                  <Check className="h-4 w-4 stroke-[3] animate-bounce" />
                  Publishing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {isEditing ? "Publish Update" : "Broadcast Chronicle"}
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* RIGHT COLUMN: Real-time Live Preview */}
      <div className={`lg:col-span-6 space-y-6 ${activeTab === "edit" ? "hidden lg:block" : "block"}`}>
        <div className="rounded-3xl border border-border-color bg-bg-surface p-6 md:p-8 shadow-sm space-y-6 min-h-[500px]">
          
          <div className="flex items-center justify-between border-b border-border-color/60 pb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <Eye className="h-4 w-4 text-secondary animate-pulse" />
              Live Theme Render
            </h2>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary animate-ping" />
              <span className="text-[10px] text-text-muted font-bold">Synchronized</span>
            </div>
          </div>

          {/* Main layout skeleton simulator */}
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">
                {category}
              </span>
              <h1 className="text-xl md:text-3xl font-extrabold text-text-main mt-2 leading-tight">
                {title || "Untitled Masterpiece"}
              </h1>
              <div className="flex items-center gap-3 text-[10px] text-text-muted mt-3">
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {readTime}
                </span>
                <span>•</span>
                <span>Right Now</span>
              </div>
            </div>

            {/* Thumbnail preview */}
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-border-color">
              <Image
                src={coverImage || COVER_PRESETS[0].url}
                alt="Live Cover Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Tags Cloud Preview */}
            {parsedTagsPreview.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {parsedTagsPreview.map((t, i) => (
                  <span key={i} className="text-[9px] font-semibold text-text-muted">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Content Divider */}
            <hr className="border-border-color/60 my-4" />

            {/* Rendered content Markdown body */}
            <div className="prose dark:prose-invert max-w-none text-text-main">
              {renderPreviewMarkdown(content)}
            </div>

          </div>

        </div>
      </div>

      {/* Floating Toggle Tabs for Mobile layout */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex rounded-full border border-border-color bg-bg-surface p-1 shadow-lg lg:hidden">
        <button
          onClick={() => setActiveTab("edit")}
          className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
            activeTab === "edit"
              ? "bg-primary text-white"
              : "text-text-muted"
          }`}
        >
          Editor Panel
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
            activeTab === "preview"
              ? "bg-primary text-white"
              : "text-text-muted"
          }`}
        >
          Theme Preview
        </button>
      </div>

    </div>
  );
}

export default function WritePage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Suspense 
          fallback={
            <div className="flex h-[300px] flex-col items-center justify-center text-text-muted">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="mt-3 text-xs">Aligning editor state...</span>
            </div>
          }
        >
          <EditorContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
