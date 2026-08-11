"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBlog } from "../context/BlogContext";
import { Menu, X, Palette, Search, Check } from "./icons";

const THEMES = [
  { id: "tech",      name: "Midnight Tech",  isDark: true,  colors: ["#3b82f6", "#10b981", "#0b0f19"] },
  { id: "cyberpunk", name: "Neo-Cyberpunk",  isDark: true,  colors: ["#ff007f", "#00f0ff", "#060211"] },
  { id: "nordic",    name: "Nordic Forest",  isDark: false, colors: ["#1e3f20", "#5f8d4e", "#f3f6f4"] },
  { id: "sakura",    name: "Sakura Rose",    isDark: false, colors: ["#d46a7f", "#fbc4c4", "#fff6f6"] },
  { id: "retro",     name: "Retro Amber",    isDark: true,  colors: ["#ffb000", "#00ff66", "#0f0b07"] },
  { id: "sunset",    name: "Sunset Oasis",   isDark: false, colors: ["#f97316", "#ec4899", "#fafaf9"] },
];

const NAV_LINKS = [
  { href: "/",        label: "Home"   },
  { href: "/tech",    label: "Tech"   },
  { href: "/sports",  label: "Sports" },
  { href: "/movies",  label: "Movies" },
  { href: "/health",  label: "Health" },
  { href: "/about",   label: "About"  },
];

export default function Navbar() {
  const { theme, setTheme } = useBlog();
  const pathname = usePathname();
  const [isOpen, setIsOpen]         = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => { setIsOpen(false); setShowThemes(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-bg-surface/80 backdrop-blur-md shadow-lg border-b border-border-color"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* ── Brand & Impressive Logo ── */}
          <Link href="/" className="flex-shrink-0 group flex items-center gap-3 select-none">
            {/* Geometric Glowing Logo Mark */}
            <div className="relative h-9 w-9 flex items-center justify-center">
              <svg 
                className="h-full w-full text-primary transition-transform duration-300 group-hover:scale-110" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer Glowing Hexagon */}
                <path 
                  d="M50 5 L90 28 L90 72 L50 95 L10 72 L10 28 Z" 
                  stroke="currentColor" 
                  strokeWidth="7" 
                  strokeLinejoin="round" 
                  className="drop-shadow-[0_0_6px_var(--primary)]"
                />
                {/* Inner Decorative Hexagon */}
                <path 
                  d="M50 16 L80 33 L80 67 L50 84 L20 67 L20 33 Z" 
                  stroke="var(--secondary)" 
                  strokeWidth="3.5" 
                  strokeLinejoin="round" 
                  opacity="0.85"
                />
                {/* Central Letter P */}
                <text 
                  x="50" 
                  y="63" 
                  textAnchor="middle" 
                  fill="currentColor" 
                  className="font-impact text-3xl"
                  style={{ fontFamily: "Impact, sans-serif", fontWeight: "normal", letterSpacing: "0" }}
                >
                  P
                </text>
              </svg>
            </div>

            {/* Brand Typography */}
            <span
              className="text-lg leading-none font-impact flex items-baseline gap-0.5"
              style={{ fontFamily: "Impact, sans-serif", fontWeight: "normal", letterSpacing: "0.06em" }}
            >
              <span className="text-primary">Paragon</span>
              <span className="text-text-main">Soft</span>
              <span 
                className="text-[11px] ml-1 font-sans font-bold uppercase tracking-wider text-text-muted"
                style={{ fontFamily: "sans-serif", letterSpacing: "0.05em" }}
              >
                Blogs
              </span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-muted hover:text-text-main hover:bg-border-color/30"
                  }`}
                  style={{ 
                    fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", 
                    letterSpacing: "0.08em",
                    fontWeight: "normal"
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Actions ── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search shortcut */}
            <Link
              href="/search"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-color bg-bg-surface/50 text-text-muted hover:border-primary/50 hover:text-primary transition-all text-xs font-semibold"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemes(!showThemes)}
                className="flex items-center justify-center p-2.5 rounded-full border border-border-color bg-bg-surface hover:bg-border-color/30 transition-all text-text-muted hover:text-primary group relative"
                aria-label="Switch Theme"
              >
                <Palette className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
                </span>
              </button>

              {showThemes && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowThemes(false)} />
                  <div className="absolute right-0 mt-3 w-60 origin-top-right rounded-2xl border border-border-color bg-bg-surface p-2 shadow-2xl z-20">
                    <div className="px-3 py-2 border-b border-border-color mb-1">
                      <span 
                        className="text-[10px] uppercase tracking-widest text-text-muted" 
                        style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", fontWeight: "normal", letterSpacing: "0.1em" }}
                      >
                        Choose Theme
                      </span>
                    </div>
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id); setShowThemes(false); }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all hover:bg-border-color/40 ${
                          theme === t.id ? "bg-primary/5 text-primary font-semibold" : "text-text-main"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-1.5">
                            {t.colors.map((c, i) => (
                              <span key={i} className="h-4 w-4 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: c, zIndex: 3 - i }} />
                            ))}
                          </div>
                          <span>{t.name}</span>
                        </div>
                        {theme === t.id && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Mobile ── */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => {
                const idx = (THEMES.findIndex(t => t.id === theme) + 1) % THEMES.length;
                setTheme(THEMES[idx].id);
              }}
              className="p-2 rounded-full border border-border-color bg-bg-surface text-text-muted"
              title="Cycle Theme"
            >
              <Palette className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full border border-border-color bg-bg-surface text-text-muted"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {isOpen && (
        <div className="md:hidden border-b border-border-color bg-bg-surface px-4 py-4">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-xl text-sm uppercase tracking-wider transition-all ${
                    isActive ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text-main"
                  }`}
                  style={{ 
                    fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", 
                    letterSpacing: "0.08em",
                    fontWeight: "normal"
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/search" className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-text-muted border border-border-color font-semibold">
              <Search className="h-4 w-4" /> Search Articles
            </Link>
          </nav>
          <div className="mt-4 pt-3 border-t border-border-color flex flex-wrap gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  theme === t.id ? "border-primary bg-primary/10 text-primary" : "border-border-color text-text-muted"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.colors[0] }} />
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
