"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CategoryPageContent } from "../components/CategoryPageContent";

const HealthSvg = (
  <svg className="h-44 w-44 animate-float text-primary drop-shadow-[0_0_16px_var(--primary)]"
    viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 20 C50 20 30 10 20 30 C10 50 30 70 50 80 C70 70 90 50 80 30 C70 10 50 20 50 20Z"
      stroke="var(--secondary)" strokeWidth="2" fill="none" opacity="0.5" />
    <line x1="50" y1="35" x2="50" y2="65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="35" y1="50" x2="65" y2="50" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
  </svg>
);

export default function HealthBlogsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base theme-transition">
      <Navbar />
      <CategoryPageContent
        category="Health"
        heroLabel="Health & Wellness"
        heroTitle="Health"
        heroSubtitle="Broadcasts."
        heroDescription="Science-backed habits for mental wellness, physical longevity, nutrition parameters, and workflow attention control."
        heroSvg={HealthSvg}
      />
      <Footer />
    </div>
  );
}
