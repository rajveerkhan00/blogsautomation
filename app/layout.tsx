import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BlogProvider } from "./context/BlogContext";
import AnalyticsTracker from "./components/AnalyticsTracker";

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
  description: "Expert-curated articles on Technology, Sports, Cinema, and Health. ParagonSoftBlogs delivers quality editorial content for curious minds — no clickbait, no filler.",
  keywords: ["tech blog", "sports blog", "movies blog", "health blog", "ParagonSoftBlogs"],
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
      </body>
    </html>
  );
}
