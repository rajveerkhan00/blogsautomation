"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Check, AlertCircle, RefreshCw, ArrowLeft } from "../components/icons";

interface TestStatus {
  status: "pending" | "success" | "error" | "skipped" | "idle";
  message: string;
  latencyMs: number;
  testOutput?: string;
  url?: string;
}

interface TestResults {
  mongodb: TestStatus;
  groq: TestStatus;
  cloudflare: TestStatus;
  cloudinary: TestStatus;
}

export default function TestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [testImage, setTestImage] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [results, setResults] = useState<TestResults>({
    mongodb: { status: "idle", message: "Not checked yet", latencyMs: 0 },
    groq: { status: "idle", message: "Not checked yet", latencyMs: 0 },
    cloudflare: { status: "idle", message: "Not checked yet", latencyMs: 0 },
    cloudinary: { status: "idle", message: "Not checked yet", latencyMs: 0 },
  });

  const runDiagnostics = async () => {
    setIsRunning(true);
    setHasRun(true);
    // Set pending states
    setResults({
      mongodb: { status: "pending", message: "Connecting to cluster...", latencyMs: 0 },
      groq: { status: "pending", message: "Sending completion request...", latencyMs: 0 },
      cloudflare: testImage ? { status: "pending", message: "Generating image...", latencyMs: 0 } : { status: "skipped", message: "Skipped", latencyMs: 0 },
      cloudinary: testImage ? { status: "pending", message: "Uploading to cloud...", latencyMs: 0 } : { status: "skipped", message: "Skipped", latencyMs: 0 },
    });

    try {
      const res = await fetch(`/api/test-connections?image=${testImage}`);
      const data = await res.json();
      
      setResults({
        mongodb: data.results.mongodb,
        groq: data.results.groq,
        cloudflare: data.results.cloudflare,
        cloudinary: data.results.cloudinary,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Handshake failed";
      setResults({
        mongodb: { status: "error", message: errorMsg, latencyMs: 0 },
        groq: { status: "error", message: errorMsg, latencyMs: 0 },
        cloudflare: { status: "error", message: errorMsg, latencyMs: 0 },
        cloudinary: { status: "error", message: errorMsg, latencyMs: 0 },
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestStatus["status"]) => {
    switch (status) {
      case "success":
        return <Check className="h-5 w-5 text-secondary" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <RefreshCw className="h-5 w-5 text-primary animate-spin" />;
      case "skipped":
        return <span className="text-xs text-text-muted">Skipped</span>;
      default:
        return <span className="text-xs text-text-muted">—</span>;
    }
  };

  const getStatusBadgeClass = (status: TestStatus["status"]) => {
    switch (status) {
      case "success":
        return "bg-secondary/10 border-secondary/20 text-secondary";
      case "error":
        return "bg-red-500/10 border-red-500/20 text-red-500";
      case "pending":
        return "bg-primary/10 border-primary/20 text-primary";
      default:
        return "bg-bg-base border-border-color text-text-muted";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-base theme-transition">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-primary transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Home Feed
          </Link>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-10 glass-panel border border-border-color">
          <div className="absolute top-1/4 right-1/4 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 h-56 w-56 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center md:text-left md:flex items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary mb-4 uppercase tracking-widest"
                style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
                Integrations Diagnostics
              </span>
              <h1 className="text-4xl md:text-5xl uppercase leading-none mb-3 text-text-main"
                style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
                API Connection test.
              </h1>
              <p className="text-sm text-text-muted leading-relaxed">
                Check and verify credentials in `.env.local` for MongoDB, Groq, Cloudflare Worker, and Cloudinary.
              </p>
            </div>

            <div className="mt-6 md:mt-0 flex flex-col items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-text-muted cursor-pointer hover:text-text-main transition-colors">
                <input
                  type="checkbox"
                  checked={testImage}
                  onChange={(e) => setTestImage(e.target.checked)}
                  className="rounded border-border-color bg-bg-surface text-primary focus:ring-primary/20 cursor-pointer h-4 w-4"
                />
                Test Image Generation Pipeline
              </label>

              <button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 text-sm font-semibold shadow-md hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
                {isRunning ? "Testing APIs..." : "Run Complete Diagnostics"}
              </button>
            </div>
          </div>
        </section>

        {/* API Results */}
        {hasRun && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* MongoDB */}
              <div className="rounded-2xl p-6 glass-panel border border-border-color space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text-main" style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", letterSpacing: "0.04em" }}>
                    1. MONGODB ATLAS
                  </h3>
                  <div className={`border rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1.5 ${getStatusBadgeClass(results.mongodb.status)}`}>
                    {getStatusIcon(results.mongodb.status)}
                    <span className="capitalize">{results.mongodb.status}</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {results.mongodb.message}
                </p>
                {results.mongodb.latencyMs > 0 && (
                  <span className="text-[10px] text-primary font-bold">Latency: {results.mongodb.latencyMs}ms</span>
                )}
              </div>

              {/* Groq AI */}
              <div className="rounded-2xl p-6 glass-panel border border-border-color space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text-main" style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", letterSpacing: "0.04em" }}>
                    2. GROQ CLOUD API
                  </h3>
                  <div className={`border rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1.5 ${getStatusBadgeClass(results.groq.status)}`}>
                    {getStatusIcon(results.groq.status)}
                    <span className="capitalize">{results.groq.status}</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {results.groq.message}
                </p>
                {results.groq.testOutput && (
                  <div className="rounded-lg bg-bg-base/70 p-3 border border-border-color/60 font-mono text-[10px] text-secondary">
                    Response: "{results.groq.testOutput}"
                  </div>
                )}
                {results.groq.latencyMs > 0 && (
                  <span className="text-[10px] text-primary font-bold">Latency: {results.groq.latencyMs}ms</span>
                )}
              </div>

              {/* Cloudflare Worker */}
              <div className="rounded-2xl p-6 glass-panel border border-border-color space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text-main" style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", letterSpacing: "0.04em" }}>
                    3. CLOUDFLARE WORKER
                  </h3>
                  <div className={`border rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1.5 ${getStatusBadgeClass(results.cloudflare.status)}`}>
                    {getStatusIcon(results.cloudflare.status)}
                    <span className="capitalize">{results.cloudflare.status}</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {results.cloudflare.message}
                </p>
                {results.cloudflare.latencyMs > 0 && (
                  <span className="text-[10px] text-primary font-bold">Latency: {results.cloudflare.latencyMs}ms</span>
                )}
              </div>

              {/* Cloudinary */}
              <div className="rounded-2xl p-6 glass-panel border border-border-color space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text-main" style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", letterSpacing: "0.04em" }}>
                    4. CLOUDINARY MEDIA
                  </h3>
                  <div className={`border rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1.5 ${getStatusBadgeClass(results.cloudinary.status)}`}>
                    {getStatusIcon(results.cloudinary.status)}
                    <span className="capitalize">{results.cloudinary.status}</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {results.cloudinary.message}
                </p>
                {results.cloudinary.latencyMs > 0 && (
                  <span className="text-[10px] text-primary font-bold">Latency: {results.cloudinary.latencyMs}ms</span>
                )}
              </div>

            </div>

            {/* Test Image Display */}
            {results.cloudinary.url && (
              <div className="rounded-2xl p-6 glass-panel border border-border-color space-y-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-1.5" style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif" }}>
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Generated Test Image Preview
                </h3>
                <div className="relative aspect-[16/9] w-full max-w-lg mx-auto rounded-xl overflow-hidden border border-border-color shadow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={results.cloudinary.url}
                    alt="AI Generated Test Result"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-center">
                  <a
                    href={results.cloudinary.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Open Image in New Tab →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
