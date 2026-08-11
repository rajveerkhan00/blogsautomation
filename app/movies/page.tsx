"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CategoryPageContent } from "../components/CategoryPageContent";

const MoviesSvg = (
  <svg className="h-44 w-44 animate-float text-primary drop-shadow-[0_0_16px_var(--primary)]"
    viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="30" width="60" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="50" cy="50" r="10" stroke="var(--secondary)" strokeWidth="2" />
    <circle cx="50" cy="50" r="4" fill="var(--primary)" />
    <line x1="20" y1="30" x2="20" y2="70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <line x1="80" y1="30" x2="80" y2="70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <line x1="20" y1="38" x2="80" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <line x1="20" y1="62" x2="80" y2="62" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <rect x="20" y="22" width="60" height="8" rx="2" fill="var(--primary)" fillOpacity="0.2" stroke="var(--primary)" strokeWidth="1" />
  </svg>
);

export default function MoviesBlogsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base theme-transition">
      <Navbar />
      <CategoryPageContent
        category="Movies"
        heroLabel="Movies Section"
        heroTitle="Movies"
        heroSubtitle="Broadcasts."
        heroDescription="Rankings and reviews of mind-bending science fiction, Cannes winners, global masterpieces, and director selections."
        heroSvg={MoviesSvg}
      />
      <Footer />
    </div>
  );
}
