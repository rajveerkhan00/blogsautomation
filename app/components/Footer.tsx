"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Github, Twitter, Linkedin, Heart, CheckCircle2 } from "./icons";

const NAV_LINKS = [
  { label: "Home",         href: "/" },
  { label: "Tech Blogs",   href: "/tech" },
  { label: "Sports Blogs", href: "/sports" },
  { label: "Movies Blogs", href: "/movies" },
  { label: "Health Blogs", href: "/health" },
  { label: "About",        href: "/about" },
  { label: "Search",       href: "/search" },
];

const CATEGORIES = [
  { label: "Technology",   href: "/tech" },
  { label: "Sports",       href: "/sports" },
  { label: "Movies",       href: "/movies" },
  { label: "Health",       href: "/health" },
];

export default function Footer() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setStatus("error"); setMessage("Please enter an email address."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setStatus("error"); setMessage("Please enter a valid email address."); return; }
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setMessage("You're in! Welcome to ParagonSoftBlogs.");
      setEmail("");
    }, 1200);
  };

  return (
    <footer className="border-t border-border-color bg-bg-surface mt-auto"
      style={{ background: "linear-gradient(to bottom, var(--bg-surface), var(--bg-base))" }}
    >
      {/* Top glow stripe */}
      <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, var(--primary), var(--secondary), transparent)" }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-18">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">

          {/* ── Brand Column ───────────────────────────── */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 group mb-5">
              {/* Hexagon SVG Logo */}
              <svg
                viewBox="0 0 40 40"
                className="h-10 w-10 transition-transform duration-300 group-hover:scale-110"
                style={{ filter: "drop-shadow(0 0 8px var(--primary))" }}
              >
                <polygon
                  points="20,2 36,11 36,29 20,38 4,29 4,11"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  opacity="0.4"
                />
                <polygon
                  points="20,5 33,12.5 33,27.5 20,35 7,27.5 7,12.5"
                  fill="var(--primary)"
                  fillOpacity="0.12"
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                />
                <text
                  x="50%"
                  y="55%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="18"
                  fontFamily="Impact, 'Arial Narrow', Arial, sans-serif"
                  fontWeight="400"
                  letterSpacing="0"
                >
                  P
                </text>
              </svg>
              <div>
                <span
                  className="block text-xl leading-none text-text-main"
                  style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", fontWeight: 400, letterSpacing: "0.04em" }}
                >
                  Paragon<span style={{ color: "var(--primary)" }}>Soft</span>Blogs
                </span>
                <span className="block text-[10px] text-text-muted uppercase tracking-widest mt-0.5">
                  Premium Editorial Platform
                </span>
              </div>
            </Link>

            <p className="text-sm leading-6 text-text-muted max-w-xs">
              Expert-curated articles across Technology, Sports, Cinema &amp; Health.
              No clickbait. No sponsored filler. Just quality writing for curious minds.
            </p>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-4 text-text-muted">
              <a href="#" aria-label="Twitter" className="hover:text-primary transition-colors duration-200 hover:scale-110 transform">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="GitHub" className="hover:text-primary transition-colors duration-200 hover:scale-110 transform">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-primary transition-colors duration-200 hover:scale-110 transform">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* ── Quick Links ────────────────────────────── */}
          <div className="md:col-span-2">
            <h3
              className="text-xs font-bold uppercase tracking-widest text-text-main mb-5"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", fontWeight: 400, color: "var(--primary)" }}
            >
              Navigate
            </h3>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Categories ─────────────────────────────── */}
          <div className="md:col-span-2">
            <h3
              className="text-xs font-bold uppercase tracking-widest text-text-main mb-5"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", fontWeight: 400, color: "var(--primary)" }}
            >
              Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              {CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-text-muted hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Newsletter ─────────────────────────────── */}
          <div className="md:col-span-4">
            <h3
              className="text-xs font-bold uppercase tracking-widest text-text-main mb-2"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", fontWeight: 400, color: "var(--primary)" }}
            >
              Stay Updated
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              Get the best articles from ParagonSoftBlogs delivered to your inbox. No spam, ever.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-border-color bg-bg-base py-2.5 pl-9 pr-4 text-sm text-text-main placeholder-text-muted outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/25"
                  disabled={status === "success"}
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 px-4 text-sm font-medium text-white shadow-md transition-all cursor-pointer active:scale-[0.98] ${
                  status === "success"
                    ? "bg-secondary hover:bg-secondary/90"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {status === "loading" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : status === "success" ? (
                  <><CheckCircle2 className="h-4 w-4" /> Subscribed!</>
                ) : (
                  <>Subscribe <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
              {status === "error" && <p className="text-xs font-medium text-red-500">{message}</p>}
              {status === "success" && <p className="text-xs font-medium text-secondary flex items-center gap-1">{message}</p>}
            </form>
          </div>
        </div>

        {/* ── Footer Bottom Bar ──────────────────────── */}
        <div className="mt-12 pt-8 border-t border-border-color/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted text-center sm:text-left">
            &copy; {new Date().getFullYear()}{" "}
            <span style={{ color: "var(--primary)", fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", fontWeight: 400 }}>
              ParagonSoftBlogs
            </span>
            . All rights reserved.
          </p>
          <p className="text-xs text-text-muted flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for curious minds.
          </p>
        </div>
      </div>
    </footer>
  );
}
