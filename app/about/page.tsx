"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Check, Send, Star, ShieldCheck } from "../components/icons";

const TEAM = [
  { name: "Alex Rivera",    role: "Tech Editor",     emoji: "💻" },
  { name: "James Thornton", role: "Sports Desk",      emoji: "⚽" },
  { name: "Sophia Laurent", role: "Film Critic",      emoji: "🎬" },
  { name: "Dr. Nadia Hassan", role: "Health Columnist", emoji: "🧠" },
];

export default function AboutPage() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [message, setMessage] = useState("");
  const [status,  setStatus]  = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg,  setErrMsg]  = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("error"); setErrMsg("Please fill in all fields."); return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setStatus("error"); setErrMsg("Enter a valid email address."); return;
    }
    setStatus("loading"); setErrMsg("");
    setTimeout(() => { setStatus("success"); setName(""); setEmail(""); setMessage(""); }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-base theme-transition">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl p-8 md:p-14 mb-16 glass-panel grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-border-color">
          {/* Ambient Lighting Backgrounds */}
          <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-breathe" />
          <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none animate-breathe" />

          <div className="md:col-span-8 relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3.5 py-1 text-xs font-bold text-secondary mb-5 uppercase tracking-widest"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
              <Star className="h-3 w-3" /> Our Mission
            </span>
            <h1
              className="text-5xl md:text-7xl leading-none mb-5 uppercase"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient">
                Built for
              </span>
              <br />
              <span className="text-text-main">Curious Minds.</span>
            </h1>
            <p className="text-sm md:text-base text-text-muted leading-relaxed mb-4 max-w-lg">
              ParagonSoftBlogs is an independent editorial platform delivering expert-curated articles
              across Technology, Sports, Cinema, and Health. No clickbait. No sponsored filler. Just quality writing.
            </p>
          </div>

          {/* Right Column: Dynamic Planetary Compass SVG Emblem */}
          <div className="hidden md:block md:col-span-4 relative z-10 justify-self-center">
            <svg 
              className="h-32 w-32 animate-float text-primary drop-shadow-[0_0_12px_var(--primary)]" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="28" stroke="var(--secondary)" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="2" />
              <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
              <polygon points="50,30 55,50 50,70 45,50" fill="var(--secondary)" />
              <polygon points="30,50 50,55 70,50 50,45" fill="currentColor" opacity="0.8" />
              <circle cx="50" cy="50" r="3.5" fill="var(--primary)" />
            </svg>
          </div>
        </section>

        {/* ── WHAT WE COVER ── */}
        <section>
          <h2
            className="text-2xl uppercase text-text-main mb-6 text-center"
            style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
          >
            What We Cover
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "💻", cat: "Tech",    desc: "AI, frontend dev, software engineering" },
              { emoji: "⚽", cat: "Sports",  desc: "Football, athletics, sports science" },
              { emoji: "🎬", cat: "Movies",  desc: "Film reviews, industry news, rankings" },
              { emoji: "🧠", cat: "Health",  desc: "Mental wellness, fitness, nutrition" },
            ].map(({ emoji, cat, desc }) => (
              <div key={cat} className="rounded-2xl glass-panel p-5 text-center shadow-sm hover:border-primary/30 transition-all hover:-translate-y-0.5 neon-glow-hover border border-border-color">
                <span className="text-3xl mb-2 block">{emoji}</span>
                <h3
                  className="text-sm uppercase font-black text-text-main mb-1"
                  style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
                >
                  {cat}
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── OUR TEAM ── */}
        <section>
          <h2
            className="text-2xl uppercase text-text-main mb-6 text-center"
            style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
          >
            The Team
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEAM.map(({ name, role, emoji }) => (
              <div key={name} className="rounded-2xl glass-panel p-5 text-center shadow-sm hover:border-primary/30 transition-all border border-border-color">
                <span className="text-3xl mb-2 block">{emoji}</span>
                <h3
                  className="text-sm uppercase font-black text-text-main"
                  style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
                >{name}</h3>
                <p className="text-[10px] text-text-muted mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="rounded-3xl glass-panel p-8 shadow-sm border border-border-color">
          <h2
            className="text-2xl uppercase text-text-main mb-6 text-center"
            style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
          >
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <ShieldCheck className="h-6 w-6 text-primary" />, title: "Editorial Independence", desc: "No sponsored content. No brand deals. Our writers are never told what to say." },
              { icon: <Star className="h-6 w-6 text-secondary" />, title: "Quality Over Quantity", desc: "We publish fewer articles than most — because each one goes through a rigorous review process." },
              { icon: <Check className="h-6 w-6 text-accent" />, title: "Facts First", desc: "Every claim is sourced. We link to original research and cite experts by name." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center space-y-2">
                <div className="flex justify-center mb-2">{icon}</div>
                <h3
                  className="text-sm uppercase font-black text-text-main"
                  style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
                >{title}</h3>
                <p className="text-[11px] text-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="max-w-lg mx-auto rounded-3xl glass-panel p-7 md:p-10 shadow-sm border border-border-color">
          <h2
            className="text-2xl uppercase text-text-main mb-1 text-center"
            style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}
          >
            Get In Touch
          </h2>
          <p className="text-xs text-text-muted text-center mb-6">Pitches, corrections, partnerships — we read every message.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" value={name} onChange={e => { setName(e.target.value); if (status === "error") setStatus("idle"); }}
                placeholder="Your Name" disabled={status === "success"}
                className="w-full rounded-xl border border-border-color bg-bg-base/70 p-3 text-xs text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 font-semibold" />
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                placeholder="Email Address" disabled={status === "success"}
                className="w-full rounded-xl border border-border-color bg-bg-base/70 p-3 text-xs text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 font-semibold" />
            </div>
            <textarea value={message} onChange={e => { setMessage(e.target.value); if (status === "error") setStatus("idle"); }}
              placeholder="Your message..." rows={4} disabled={status === "success"}
              className="w-full rounded-xl border border-border-color bg-bg-base/70 p-3 text-xs text-text-main outline-none focus:border-primary font-semibold" />

            {status === "error" && <p className="text-xs text-red-500 font-semibold">{errMsg}</p>}
            {status === "success" && (
              <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-3 text-xs text-secondary font-semibold flex items-center gap-2">
                <Check className="h-4 w-4" /> Message sent! We will be in touch soon.
              </div>
            )}

            <button type="submit" disabled={status === "loading" || status === "success"}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white text-xs font-black uppercase py-3 shadow-md hover:bg-primary/95 transition-all cursor-pointer hover:scale-[1.02] duration-300"
              style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", letterSpacing: "0.05em" }}>
              {status === "loading"
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : status === "success"
                  ? <><Check className="h-4 w-4" /> Sent!</>
                  : <><Send className="h-4 w-4" /> Send Message</>
              }
            </button>
          </form>
        </section>

      </main>

      <Footer />
    </div>
  );
}
