"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: "Tech" | "Sports" | "Movies" | "Health";
  tags: string[];
  coverImage: string;
  author: { name: string; avatar: string; role: string };
  createdAt: string;
  readTime: string;
  likes: number;
  views: number;
}

interface BlogContextType {
  posts: Post[];
  theme: string;
  likes: Record<string, boolean>;
  bookmarks: Record<string, boolean>;
  setTheme: (theme: string) => void;
  toggleLike: (id: string) => void;
  toggleBookmark: (id: string) => void;
  isLoaded: boolean;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

/* ─────────────────────────────────────────────────────────────
   HARDCODED POSTS — edit here to change blog content
───────────────────────────────────────────────────────────── */
const POSTS: Post[] = [
  // ── TECH ──────────────────────────────────────────────────
  {
    id: "ai-web-dev-2026",
    title: "AI Is Rewriting the Rules of Web Development",
    summary: "From auto-generated UI components to AI code reviewers that catch bugs before humans, artificial intelligence is transforming how software is built in 2026.",
    content: `## The Shift Has Already Happened

It's no longer a question of *if* AI will change how we build software — it already has. In 2026, the average developer spends less than 30% of their time writing raw code. The rest is review, architecture, and prompting.

> "The best code is the code you didn't have to write." — now more literal than ever.

## What AI Actually Does Well

### Component Generation
Tools like GitHub Copilot X and Vercel v0 can produce full, production-quality React components from a single sentence. Accessibility props, hover states, responsive breakpoints — all included.

\`\`\`bash
# Example v0 prompt
"Create a dark mode pricing table with 3 tiers, feature checkboxes, and a CTA button"
# Output: 200 lines of production-ready TSX in 4 seconds
\`\`\`

### Bug Detection Before Runtime
AI code reviewers now catch logic errors, race conditions, and security vulnerabilities at the PR level — before any human reviewer sees the code.

## What AI Still Gets Wrong

- **Business logic** that requires domain knowledge
- **System design decisions** at scale
- **Security-critical cryptographic implementations**

## The New Developer Skillset

- **Prompt engineering** — knowing how to ask AI correctly
- **Architecture thinking** — AI can't design systems, only implement them
- **Critical review** — accepting AI output blindly is the new stack overflow copy-paste problem

The developers winning in 2026 are those who treat AI as a junior engineer — brilliant at syntax, terrible at strategy.`,
    category: "Tech",
    tags: ["AI", "WebDev", "Coding", "Future"],
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    author: { name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", role: "Senior Software Engineer" },
    createdAt: "2026-08-10",
    readTime: "6 min read",
    likes: 142,
    views: 4820,
  },
  {
    id: "tailwind-v4-guide",
    title: "Tailwind CSS v4 Complete Guide: Everything Changed",
    summary: "CSS-first configuration, a Rust-powered engine, and 100x faster incremental builds. Tailwind v4 is the biggest frontend release of the decade.",
    content: `## Why v4 is a Paradigm Shift

Tailwind CSS v4 isn't an update — it's a ground-up rewrite. The team replaced the JavaScript engine with a high-performance Rust-and-Go hybrid, delivering build speeds that were simply impossible before.

## CSS-First Configuration

The \`tailwind.config.js\` file is gone. Everything lives in your CSS now:

\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand: oklch(60% 0.22 260);
  --font-heading: "Inter", sans-serif;
  --radius-card: 16px;
}
\`\`\`

This approach gives you full IntelliSense, cascading overrides, and zero-config dark mode using \`[data-theme]\` selectors.

## Performance Numbers

- Full build: **~100ms** (was 3-8 seconds in v3)
- Incremental rebuild: **~5ms**
- CSS output: **40% smaller** due to better deduplication

## Breaking Changes to Know

- Replace \`@tailwind base/components/utilities\` with \`@import "tailwindcss"\`
- JIT is now the only mode — classic purge mode removed
- Several utility class names have been normalized for consistency

### Migration Command

\`\`\`bash
npx @tailwindcss/upgrade@next
\`\`\`

The official codemod handles ~90% of the migration automatically.

## Should You Upgrade?

If you're starting a new project, absolutely use v4. For existing large codebases, wait for the ecosystem to stabilize — some plugins haven't updated yet.`,
    category: "Tech",
    tags: ["CSS", "Tailwind", "Frontend", "Performance"],
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800",
    author: { name: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150", role: "Frontend Architect" },
    createdAt: "2026-08-08",
    readTime: "7 min read",
    likes: 98,
    views: 3410,
  },

  // ── SPORTS ────────────────────────────────────────────────
  {
    id: "premier-league-2026",
    title: "Premier League 2026/27: The Most Unpredictable Season Yet",
    summary: "With three clubs separated by just 2 points at the top, a record 9 nationalities in the Golden Boot race, and VAR finally being reformed — this season is unlike any before.",
    content: `## The Title Race: Three-Way Chaos

Entering matchweek 32, Manchester City, Arsenal, and newly-resurgent Tottenham are separated by just two points. It's the closest three-way title race since 1989.

> "Every game feels like a final right now. The margins are just impossible." — Mikel Arteta, post-match interview

## Standout Performers

### The Golden Boot Battle

Nine different nationalities are represented in the top-10 scorers list — a Premier League record. The frontrunners:

- **Erling Haaland** (Man City) — 28 goals
- **Victor Osimhen** (Arsenal) — 24 goals
- **Son Heung-min** (Spurs) — 21 goals

### The Goalkeeper of the Season

David Raya's save percentage of 81.4% is the highest recorded in Premier League history for a goalkeeper who played more than 25 games.

## VAR Reforms: Do They Work?

The Premier League implemented new VAR protocols in July 2026:

- **Maximum 90-second review window** — decisions must be made faster
- **On-field referee retains final authority** in all non-offside calls
- **Public audio release** within 24 hours of all VAR interventions

Early data shows controversial decisions are down 34% compared to the same period last season.

## The Relegation Battle

The three-team battle at the bottom is equally tense. Luton Town, newly promoted Crystal Palace, and an imploding Wolves side are all looking vulnerable.

Buckle up. The final 6 matchweeks could be the most dramatic in English football history.`,
    category: "Sports",
    tags: ["Football", "PremierLeague", "Soccer", "2026"],
    coverImage: "https://images.unsplash.com/photo-1540747913346-19212a4b423a?auto=format&fit=crop&q=80&w=800",
    author: { name: "James Thornton", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150", role: "Sports Correspondent" },
    createdAt: "2026-08-06",
    readTime: "8 min read",
    likes: 215,
    views: 6780,
  },
  {
    id: "messi-longevity",
    title: "The Science Behind Messi Playing Elite Football at 39",
    summary: "How biomechanical adjustments, cryotherapy, and a radical diet overhaul have extended one of the greatest careers in human sporting history.",
    content: `## Still Elite at 39

When Lionel Messi scored a hat-trick against Atlanta United in April 2026, the football world collectively dropped its jaw. Most players retire by 35. Messi at 39 is still performing at a level that would make 25-year-olds jealous.

How?

## The Physical Transformation

### From Sprint to Drift

Messi's top speed at 27 was 32.5 km/h. Today it's 28.1 km/h — a meaningful decline. But his movement intelligence has compensated entirely.

> "He doesn't run to where the ball is. He already exists in the space it's going to." — Inter Miami fitness coach, Diego Simeone Jr.

His GPS data shows he runs **40% less total distance** per match than in 2015, yet his direct goal involvements per 90 minutes are nearly identical.

### Recovery Protocols

- **Cryotherapy**: 3-minute sessions at -110°C, 4 times per week
- **Hyperbaric oxygen chamber**: 60 minutes post-match
- **Sleep optimization**: 10 hours minimum, monitored by an Oura Ring

## The Diet Revolution

Messi's nutritionist, Giuliano Poser, overhauled his diet completely in 2020:

- Eliminated all processed sugar
- Reduced red meat to once per week
- Added targeted collagen supplementation for joint protection
- Increased omega-3 intake by 300%

## The Mental Component

Perhaps most underrated: Messi's relationship with pressure has completely changed. He no longer carries the weight of "best player in the world" — he plays with visible joy. That psychological freedom translates directly to physical performance.

We may be watching the last chapter of the greatest football story ever told. Enjoy every minute.`,
    category: "Sports",
    tags: ["Messi", "Football", "Fitness", "Legend"],
    coverImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
    author: { name: "Carlos Mendez", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", role: "Sports Science Writer" },
    createdAt: "2026-08-03",
    readTime: "9 min read",
    likes: 389,
    views: 11200,
  },

  // ── MOVIES ────────────────────────────────────────────────
  {
    id: "top-movies-2026",
    title: "10 Best Movies of 2026 That You Cannot Miss",
    summary: "From a mind-bending Christopher Nolan sci-fi epic to a raw Pakistani drama that swept Cannes — this year's cinema is historic. Our definitive ranked list.",
    content: `## A Vintage Year for Cinema

2026 is shaping up as one of the greatest years in film since 2007. Theatrical attendance is at a 12-year high, streaming originals are winning Oscars, and bold new voices are breaking through globally.

Here are the 10 films you need to see:

## 10. "Saltwater" (A24)
A brutally honest portrait of addiction in rural Alabama. Quiet, devastating, unforgettable. Florence Pugh delivers a career-best performance.

## 9. "The Weight of Stars" (Netflix)
South Korean director Bong Joon-ho returns with a science fiction epic about grief, memory, and whether consciousness can survive death. Visually spectacular.

## 8. "Noor" (Pakistani Cinema)
The film that stunned Cannes. A 16-year-old girl navigates political violence and personal loss in Lahore. Winner of the Palme d'Or. Mandatory viewing.

## 7. "Threshold" (Warner Bros)
Christopher Nolan's latest — and possibly his most personal. A quantum physicist confronts the collapse of linear time. Filmed in six countries over 4 years.

## 6–1 (Top Tier)

- **6. "Cargo"** — Tom Hanks alone on a ship for 2 hours. Somehow riveting.
- **5. "The Cartographer"** — Wes Anderson does a war film. Perfectly absurd.
- **4. "Reverie"** — Animated masterpiece from Studio Ghibli's next generation
- **3. "Exodus Protocol"** — The best action film since Mad Max: Fury Road
- **2. "Noor"** (Director's Cut, 4K) — Even better the second time
- **1. "Threshold"** — Nolan has made his masterpiece

> "Cinema is the art of showing people things they've never seen and making them feel they've always known it." — Roger Ebert

Which have you seen? Which are you most excited for? Let us know in the comments below.`,
    category: "Movies",
    tags: ["Cinema", "Movies2026", "Reviews", "Hollywood"],
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
    author: { name: "Sophia Laurent", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", role: "Film Critic" },
    createdAt: "2026-08-01",
    readTime: "6 min read",
    likes: 267,
    views: 8950,
  },

  // ── HEALTH ────────────────────────────────────────────────
  {
    id: "mental-health-habits",
    title: "5 Science-Backed Habits That Actually Improve Mental Health",
    summary: "Backed by over 200 peer-reviewed studies, these daily practices are proven to reduce anxiety, improve sleep, and build long-term psychological resilience.",
    content: `## Why Most Mental Health Advice Fails

The internet is flooded with mental health tips. Most are anecdotal, poorly researched, or designed to sell supplements. This article covers only habits with strong, replicable scientific backing.

> "The mind is not a vessel to be filled, but a fire to be kindled." — Plutarch (still true in 2026)

## Habit 1: Consistent Sleep Schedule (7–9 hours)

Not just duration — **consistency** matters most. Going to bed and waking at the same time every day (including weekends) regulates your circadian rhythm, which directly controls cortisol and serotonin production.

**The research**: A 2024 meta-analysis of 87 studies found that irregular sleep schedules were associated with a 45% higher rate of depression.

## Habit 2: 20-Minute Daily Walk (Outside)

The combination of physical movement, sunlight exposure, and novel visual stimulus (looking at varied environments) produces the most reliable mood boost of any low-effort intervention.

\`\`\`
Target: 20 minutes, daylight hours, any pace
Optional: No podcast/music — let your mind wander (produces creative default-mode network activity)
\`\`\`

## Habit 3: Social Contact — Even Brief

Phone calls (not texts) with people you genuinely like activate oxytocin pathways that texts simply don't. A 10-minute real conversation with a friend does more for mood than 2 hours of social media browsing.

## Habit 4: Journaling (10 minutes, 3×/week)

Specifically: write about something you're grateful for AND one thing that went better than expected today. This dual framing trains the brain to notice positive signal in daily noise.

**Avoid**: Stream-of-consciousness venting journaling, which research shows can actually reinforce negative thought loops.

## Habit 5: Reduce News Consumption

This sounds obvious but the data is striking. A 2025 study found that reducing news consumption to 20 minutes per day (versus unrestricted) reduced self-reported anxiety by 27% in just 30 days, with no meaningful reduction in the participants' actual awareness of world events.

Start with just one of these. Small, consistent change outperforms aggressive short-term effort every time.`,
    category: "Health",
    tags: ["MentalHealth", "Wellness", "Psychology", "Habits"],
    coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    author: { name: "Dr. Nadia Hassan", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150", role: "Clinical Psychologist" },
    createdAt: "2026-07-28",
    readTime: "7 min read",
    likes: 503,
    views: 15600,
  },
];

/* ─────────────────────────────────────────────────────────── */

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState]       = useState("tech");
  const [likes, setLikes]             = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks]     = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded]       = useState(false);

  useEffect(() => {
    try {
      const t  = localStorage.getItem("psb_theme");
      const l  = localStorage.getItem("psb_likes");
      const bk = localStorage.getItem("psb_bookmarks");
      if (t)  { setThemeState(t); document.documentElement.setAttribute("data-theme", t); }
      else    { document.documentElement.setAttribute("data-theme", "tech"); }
      if (l)  setLikes(JSON.parse(l));
      if (bk) setBookmarks(JSON.parse(bk));
    } catch { /* noop */ }
    setIsLoaded(true);
  }, []);

  const setTheme = (t: string) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("psb_theme", t);
  };

  const toggleLike = (id: string) => {
    const next = { ...likes, [id]: !likes[id] };
    setLikes(next);
    localStorage.setItem("psb_likes", JSON.stringify(next));
  };

  const toggleBookmark = (id: string) => {
    const next = { ...bookmarks, [id]: !bookmarks[id] };
    setBookmarks(next);
    localStorage.setItem("psb_bookmarks", JSON.stringify(next));
  };

  return (
    <BlogContext.Provider value={{ posts: POSTS, theme, likes, bookmarks, setTheme, toggleLike, toggleBookmark, isLoaded }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlog must be used within BlogProvider");
  return ctx;
};
