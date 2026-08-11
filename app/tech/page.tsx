"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CategoryPageContent } from "../components/CategoryPageContent";

const TechSvg = (
  <svg className="h-44 w-44 animate-float text-primary drop-shadow-[0_0_16px_var(--primary)]"
    viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="25" width="70" height="50" rx="4" stroke="currentColor" strokeWidth="2" />
    <line x1="15" y1="38" x2="85" y2="38" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="25" cy="31.5" r="2.5" fill="var(--primary)" />
    <circle cx="33" cy="31.5" r="2.5" fill="var(--secondary)" />
    <circle cx="41" cy="31.5" r="2.5" fill="currentColor" opacity="0.4" />
    <line x1="25" y1="50" x2="45" y2="50" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
    <line x1="25" y1="58" x2="65" y2="58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <line x1="25" y1="66" x2="55" y2="66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <circle cx="73" cy="55" r="10" stroke="var(--secondary)" strokeWidth="2" className="animate-pulse" />
    <line x1="73" y1="55" x2="73" y2="48" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" />
    <line x1="73" y1="55" x2="78" y2="55" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function TechBlogsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base theme-transition">
      <Navbar />
      <CategoryPageContent
        category="Tech"
        heroLabel="Tech Section"
        heroTitle="Tech"
        heroSubtitle="Broadcasts."
        heroDescription="Deep dives into software development, AI breakthroughs, cybersecurity, cloud computing, and the gadgets shaping tomorrow."
        heroSvg={TechSvg}
      />
      <Footer />
    </div>
  );
}
