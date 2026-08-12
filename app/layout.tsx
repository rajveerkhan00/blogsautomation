import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BlogProvider } from "./context/BlogContext";
import AnalyticsTracker from "./components/AnalyticsTracker";
import AdSlot from "./components/AdSlot";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ParagonSoftBlogs — Tech, Sports, Movies & Health",
    template: "%s | ParagonSoftBlogs",
  },
  description:
    "Expert-curated articles on Technology, Sports, Cinema, and Health. ParagonSoftBlogs delivers quality editorial content for curious minds — no clickbait, no filler.",
  keywords: [
    "tech blog",
    "sports blog",
    "movies blog",
    "health blog",
    "ParagonSoftBlogs",
  ],
  authors: [{ name: "ParagonSoftBlogs Editorial Team" }],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "ParagonSoftBlogs — Tech, Sports, Movies & Health",
    description: "Expert-curated articles for curious minds.",
    siteName: "ParagonSoftBlogs",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-base text-text-main theme-transition">
        <BlogProvider>
          <AnalyticsTracker />
          {children}
        </BlogProvider>

        {/* ── Ad Network Scripts ─────────────────────────────────────────── */}

        {/*
          STRATEGY:
          - "afterInteractive" fires immediately after hydration on every page
            load, in every region — never skipped like "lazyOnload".
          - AdSlot wraps each container and watches for ad injection via
            MutationObserver. If no ad fills within the timeout (VPN / proxy
            IPs get blocked server-side by the networks), AdSlot shows a
            branded fallback banner so the space is never blank.
          - On tab re-focus (user toggled VPN), AdSlot retries automatically.
        */}

        {/* ── effectivecpmnetwork ─────────────────────────────────────────── */}

        {/* Script 1 */}
        <Script
          id="ecpm-1"
          src="https://pl30803250.effectivecpmnetwork.com/04/d3/da/04d3dabc69660d1d9c1d746c1c10f49a.js"
          strategy="afterInteractive"
        />

        {/* Script 2 */}
        <Script
          id="ecpm-2"
          src="https://pl30803251.effectivecpmnetwork.com/fa/89/20/fa892032ca5497aaeff3ef1154cdcd20.js"
          strategy="afterInteractive"
        />

        {/* Push notification */}
        <Script
          id="ecpm-push"
          src="https://www.effectivecpmnetwork.com/pyvagnh5c?key=e285981266460197eb0308433b61c234"
          strategy="afterInteractive"
        />

        {/*
          Invoke script — data-cfasync="false" MUST reach the DOM.
          Next.js <Script> strips unknown attributes, so we inject the tag
          manually via an IIFE preserving the attribute.
          The container div is owned by <AdSlot> below (id passed as prop).
        */}
        <Script
          id="ecpm-3-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var s = document.createElement('script');
                s.src = 'https://pl30803253.effectivecpmnetwork.com/58a81b64213dd30a97a673fcc3c7d4d3/invoke.js';
                s.async = true;
                s.setAttribute('data-cfasync', 'false');
                document.head.appendChild(s);
              })();
            `,
          }}
        />

        {/*
          AdSlot renders the required container div with the correct id.
          If the invoke script fills it → shows real ad.
          If blocked (VPN / proxy / no inventory) → shows fallback banner.
        */}
        <AdSlot
          containerId="container-58a81b64213dd30a97a673fcc3c7d4d3"
          className="my-2 px-4 sm:px-6 lg:px-8"
          minHeight={68}
        />

        {/* ── highperformanceformat ────────────────────────────────────────── */}

        {/*
          atOptions MUST be on window before invoke.js executes.
          "beforeInteractive" guarantees it runs before any other script.
        */}
        <Script
          id="hpf-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.atOptions = {
                'key' : 'd404c3e8d8fde5ac0df8f054bbc542fc',
                'format' : 'iframe',
                'height' : 60,
                'width' : 468,
                'params' : {}
              };
            `,
          }}
        />

        {/* Invoke script */}
        <Script
          id="hpf-invoke"
          src="https://www.highperformanceformat.com/d404c3e8d8fde5ac0df8f054bbc542fc/invoke.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
