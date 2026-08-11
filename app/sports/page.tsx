"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CategoryPageContent } from "../components/CategoryPageContent";

const SportsSvg = (
  <svg className="h-44 w-44 animate-float text-primary drop-shadow-[0_0_16px_var(--primary)]"
    viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="50" rx="40" ry="14" stroke="currentColor" strokeWidth="2.5" transform="rotate(-30 50 50)" />
    <ellipse cx="50" cy="50" rx="40" ry="14" stroke="var(--secondary)" strokeWidth="2" transform="rotate(30 50 50)" opacity="0.6" />
    <ellipse cx="50" cy="50" rx="40" ry="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
    <circle cx="50" cy="50" r="6" fill="var(--primary)" />
    <circle cx="50" cy="50" r="12" stroke="var(--primary)" strokeWidth="1" opacity="0.4" />
  </svg>
);

export default function SportsBlogsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base theme-transition">
      <Navbar />
      <CategoryPageContent
        category="Sports"
        heroLabel="Sports Section"
        heroTitle="Sports"
        heroSubtitle="Broadcasts."
        heroDescription="In-depth coverage of football tactics, athlete longevity, physical recovery science, and seasonal title races."
        heroSvg={SportsSvg}
      />
      <Footer />
    </div>
  );
}
