/**
 * blogGenerator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Core AI blog generation pipeline for ParagonSoftBlogs.
 *
 * Flow per blog:
 *   1. Fetch existing titles from MongoDB  → avoid duplicates
 *   2. Groq  → generate unique topic + full SEO HTML blog
 *   3. Groq  → generate image prompt from blog title/category
 *   4. Cloudflare Worker → generate image
 *   5. Cloudinary → upload image, get permanent URL
 *   6. MongoDB → save full blog document
 * ─────────────────────────────────────────────────────────────────────────────
 */

import connectDB from "./mongodb";
import Blog, { IBlog } from "./models/Blog";
import groqClient from "./groq";
import { v2 as cloudinary } from "cloudinary";

// ── Cloudinary config ───────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ── Types ────────────────────────────────────────────────────────────────────
type Category = "Tech" | "Movies" | "Health" | "Sports";

interface GeneratedBlogData {
  title: string;
  slug: string;
  category: Category;
  content: string;
  excerpt: string;
  metaDescription: string;
  tags: string[];
  seoKeywords: string[];
  readTime: string;
  imagePrompt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80);
}

function estimateReadTime(content: string): string {
  const wordCount = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  const minutes = Math.max(4, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

// ── JSON Sanitizer ───────────────────────────────────────────────────────────
// Groq embeds raw HTML (with literal newlines/tabs) inside JSON string values.
// JSON.parse rejects bare control characters — walk char-by-char and escape them.
function sanitizeJSON(input: string): string {
  const start = input.indexOf("{");
  const end   = input.lastIndexOf("}");
  if (start === -1 || end === -1) return input;

  const raw = input.slice(start, end + 1);
  let result   = "";
  let inString = false;
  let escaped  = false;

  for (let i = 0; i < raw.length; i++) {
    const ch   = raw[i];
    const code = ch.charCodeAt(0);

    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === "\\" && inString) { result += ch; escaped = true; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }

    if (inString && code < 0x20) {
      if (ch === "\n") { result += "\\n";  continue; }
      if (ch === "\r") { result += "\\r";  continue; }
      if (ch === "\t") { result += "\\t";  continue; }
      if (ch === "\b") { result += "\\b";  continue; }
      if (ch === "\f") { result += "\\f";  continue; }
      continue; // drop other control chars
    }

    result += ch;
  }

  return result;
}

// ── Step 1: Fetch existing titles to avoid duplicates ───────────────────────
async function getExistingTitles(category: Category): Promise<string[]> {
  await connectDB();
  const blogs = await Blog.find({ category }, { title: 1, _id: 0 }).lean();
  return blogs.map((b) => b.title);
}

// ── Step 2: Generate full SEO blog via Groq ──────────────────────────────────
async function generateBlogContent(
  category: Category,
  existingTitles: string[]
): Promise<GeneratedBlogData> {
  const existingList =
    existingTitles.length > 0
      ? `\n\nIMPORTANT — Do NOT write about any of these already-published topics:\n${existingTitles.map((t) => `- ${t}`).join("\n")}`
      : "";

  const categoryContext: Record<Category, string> = {
    Tech:    "technology, software development, AI, gadgets, cybersecurity, programming, cloud computing, startups",
    Movies:  "cinema, film analysis, movie reviews, directors, acting, cinematography, box office, streaming",
    Health:  "wellness, nutrition, mental health, fitness, medical research, sleep science, longevity, biohacking",
    Sports:  "athletics, football, basketball, training science, sports psychology, performance, esports, competitions",
  };

  const internalLink: Record<Category, string> = {
    Tech:   "/tech",
    Movies: "/movies",
    Health: "/health",
    Sports: "/sports",
  };

  const prompt = `You are an elite SEO content writer for ParagonSoftBlogs, a premium editorial platform.

Write a comprehensive, 100% unique, SEO-perfect blog article about: ${category} (${categoryContext[category]}).${existingList}

Requirements:
- Pick an original, compelling, specific topic (not generic)
- Minimum 1200 words of real, informative content
- Full HTML using h2, h3, p, ul, li, strong, em, blockquote tags
- Include this internal link: <a href="${internalLink[category]}">explore more ${category.toLowerCase()} articles on ParagonSoftBlogs</a>
- Add 2 relevant external links to authoritative sources
- SEO-optimized with primary keyword in first paragraph and headings
- Add a Key Takeaways section at the end
- Engaging, authoritative, human writing style

CRITICAL: Respond ONLY with a single valid JSON object. No markdown fences. No text before or after.
The JSON must have exactly these keys:
{
  "title": "SEO title under 60 characters",
  "metaDescription": "SEO meta description 150-160 characters",
  "excerpt": "2-3 sentence article teaser under 200 characters",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "seoKeywords": ["primary keyword", "secondary keyword", "long tail phrase"],
  "content": "FULL HTML BLOG CONTENT HERE - all on ONE LINE with no literal newlines inside the JSON string - use HTML tags for structure",
  "imagePrompt": "Describe a WIDE 16:9 LANDSCAPE scene or abstract concept art for the blog cover. NO faces, NO people, NO portraits. Think cinematic establishing shot, abstract 3D art, technology background, dramatic scenery. Example style: cinematic wide shot, vibrant colors, professional editorial photography, 8K, hyper-detailed, no text"
}

IMPORTANT for the content field: write the entire HTML on a single line. Do NOT insert literal newline characters inside the JSON string value.`;

  const response = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.75,
    max_tokens: 4096,
  });

  const raw = response.choices[0]?.message?.content ?? "";

  // Sanitize then parse
  const sanitized = sanitizeJSON(raw);
  if (!sanitized.startsWith("{")) {
    throw new Error(`No JSON object found in Groq response for ${category}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: Record<string, any>;
  try {
    data = JSON.parse(sanitized);
  } catch (parseErr) {
    console.warn(`[blogGenerator] JSON.parse still failed for ${category}, using fallback extraction. Error: ${parseErr}`);
    // Fallback: extract individual string fields with regex
    const extractStr = (key: string, fallback: string): string => {
      const m = raw.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      return m ? m[1].replace(/\\n/g, "\n").replace(/\\t/g, "\t") : fallback;
    };
    data = {
      title:           extractStr("title", `${category} Insights ${Date.now()}`),
      metaDescription: extractStr("metaDescription", `Latest ${category} insights from ParagonSoftBlogs.`),
      excerpt:         extractStr("excerpt", `Explore the latest in ${category}.`),
      tags:            [category.toLowerCase(), "paragonsoft"],
      seoKeywords:     [category.toLowerCase()],
      content:         extractStr("content", `<p>Explore the latest trends in ${category}.</p>`),
      imagePrompt:     extractStr("imagePrompt", `${category} concept, professional photography, vibrant`),
    };
  }

  const slug    = slugify(String(data.title ?? category));
  const content = String(data.content ?? "");

  return {
    title:           String(data.title ?? `${category} Article`),
    slug,
    category,
    content,
    excerpt:         String(data.excerpt ?? "").slice(0, 200),
    metaDescription: String(data.metaDescription ?? "").slice(0, 160),
    tags:            Array.isArray(data.tags) ? data.tags.map(String) : [category.toLowerCase()],
    seoKeywords:     Array.isArray(data.seoKeywords) ? data.seoKeywords.map(String) : [category.toLowerCase()],
    readTime:        estimateReadTime(content),
    // Groq imagePrompt kept as fallback; dedicated step below overrides it
    imagePrompt:     String(data.imagePrompt ?? `${category} blog cover, cinematic, 16:9`),
  };
}

// ── Step 2.5: Generate content-aware image prompt via dedicated Groq call ───────
async function generateImagePrompt(blog: GeneratedBlogData): Promise<string> {
  const topTags = blog.tags.slice(0, 5).join(", ");

  const prompt = `You are a world-class AI art director specialising in editorial blog cover images.

A blog article has just been written with the following details:
- Title: "${blog.title}"
- Category: ${blog.category}
- Excerpt: "${blog.excerpt}"
- Key topics/tags: ${topTags}

Your task: Write ONE highly specific, evocative image prompt that would make a perfect blog cover for THIS exact article.

Strict rules:
- The scene MUST be directly related to the article's specific topic, not generic
- WIDE landscape orientation ONLY (16:9 ratio, horizontal composition)
- NO people, NO faces, NO portraits — use objects, environments, abstract concepts, technology, nature
- Include specific visual details that reflect the article content (e.g. for AI article: glowing neural network nodes floating in dark space; for sports: empty stadium at golden hour with dramatic lighting)
- Style: ultra-realistic, cinematic, 8K, HDR, dramatic lighting
- Length: 1-3 sentences, max 120 words

Respond with ONLY the image prompt text. No explanations, no quotes, no JSON.`;

  try {
    const response = await groqClient.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens:  200,
    });

    const raw = (response.choices[0]?.message?.content ?? "").trim();
    if (raw.length > 20) {
      console.log(`[blogGenerator] 🎨 Image prompt: "${raw.slice(0, 80)}..."`);
      return raw;
    }
  } catch (err) {
    console.warn("[blogGenerator] Dedicated image prompt generation failed, using fallback:", err);
  }

  // Fallback to Groq's inline imagePrompt from Step 2
  return blog.imagePrompt;
}


// ── Step 3: Generate cover image via Cloudflare Worker ───────────────────────
async function generateCoverImage(imagePrompt: string, slug: string): Promise<string> {
  const rawWorkerUrl = process.env.CLOUDFLARE_WORKER_URL ?? "";
  const rawApiKey = process.env.CLOUDFLARE_API_KEY ?? "";
  
  // Strip surrounding quotes if present
  const WORKER_URL = rawWorkerUrl.replace(/^["']|["']$/g, "").trim();
  const API_KEY = rawApiKey.replace(/^["']|["']$/g, "").trim();

  if (!WORKER_URL) {
    console.warn("[blogGenerator] CLOUDFLARE_WORKER_URL not set — skipping image generation");
    return "";
  }

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (API_KEY && API_KEY !== '""' && API_KEY !== "''") {
      headers["Authorization"] = `Bearer ${API_KEY}`;
    }

    let workerResponse: Response;
    let isFallback = false;

    try {
      // ── Build high-quality landscape prompt ─────────────────────────────
      const cleanPrompt = imagePrompt
        .replace(/portrait|person|woman|man|face|girl|boy|human|people/gi, "scene");

      const landscapePrompt = [
        // Composition
        "ultra-wide 16:9 cinematic landscape,",
        "professional editorial blog cover art,",
        cleanPrompt + ",",
        // Quality boosters (proven diffusion model quality tokens)
        "masterpiece, best quality, ultra-detailed,",
        "8K UHD, HDR, photorealistic,",
        "sharp focus, high resolution, stunning visuals,",
        "dramatic lighting, vivid colors, depth of field,",
        "professional DSLR photography, award-winning composition,",
        // Negative constraints
        "no faces, no people, no portraits, no text, no watermark,",
        "wide angle shot, landscape orientation",
      ].join(" ");

      workerResponse = await fetch(WORKER_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: landscapePrompt }),
      });

      if (!workerResponse.ok) {
        throw new Error(`Worker status ${workerResponse.status}`);
      }
    } catch (workerErr) {
      console.warn("[blogGenerator] Cloudflare Worker failed, falling back to Pollinations AI:", workerErr);
      const cleanForFallback = imagePrompt
        .replace(/portrait|person|woman|man|face|girl|boy|human|people/gi, "scene");
      const fallbackPrompt = encodeURIComponent(
        `ultra-wide landscape cinematic blog cover art, ${cleanForFallback}, masterpiece, best quality, 8K UHD, ultra-detailed, HDR, sharp focus, no faces, no people, no text, wide angle, 16:9`
      );
      const fallbackUrl = `https://image.pollinations.ai/prompt/${fallbackPrompt}?width=1280&height=720&nologo=true&enhance=true&model=flux`;
      workerResponse = await fetch(fallbackUrl);
      if (!workerResponse.ok) {
        throw new Error(`Cloudflare and Fallback both failed. Fallback status: ${workerResponse.status}`);
      }
      isFallback = true;
    }

    const contentType = workerResponse.headers.get("content-type") ?? "";

    if (!isFallback && contentType.includes("application/json")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json = await workerResponse.json() as any;
      return json.url ?? json.imageUrl ?? json.image_url ?? "";
    }

    // ── Convert raw response bytes to base64 data URI ────────────────────
    const buffer  = Buffer.from(await workerResponse.arrayBuffer());
    const base64  = buffer.toString("base64");
    const mime    = workerResponse.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
    const dataUri = `data:${mime};base64,${base64}`;

    // ── Upload RAW (no server-side transformation) ───────────────────────
    // Storing without any transformation keeps the master copy lossless.
    // Quality and cropping are applied at the delivery URL level only.
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder:        "paragonsoft-blogs",
      public_id:     `cover-${slug}-${Date.now()}`,
      overwrite:     false,
      quality:       100,        // store at maximum quality — no re-encode loss
      resource_type: "image",
    });

    // ── Inject full-quality delivery params into the Cloudinary URL ──────
    // Cloudinary URL format: /upload/<transforms>/v<version>/<public_id>
    // We insert q_100,f_auto,w_1200,h_630,c_fill,g_center BEFORE the version.
    const rawUrl = uploadResult.secure_url;
    const qualityUrl = rawUrl.replace(
      "/upload/",
      "/upload/q_100,f_auto,w_1200,h_630,c_fill,g_center/"
    );

    return qualityUrl;
  } catch (err) {
    console.error("[blogGenerator] Image generation failed entirely:", err);
    return "";
  }
}

// ── Step 4: Save blog to MongoDB ─────────────────────────────────────────────
async function saveBlog(data: GeneratedBlogData, coverImage: string): Promise<IBlog> {
  await connectDB();

  const existing = await Blog.findOne({ slug: data.slug });
  if (existing) throw new Error(`Blog slug "${data.slug}" already exists — skipping`);

  const blog = await Blog.create({
    title:           data.title,
    slug:            data.slug,
    category:        data.category,
    content:         data.content,
    excerpt:         data.excerpt,
    coverImage,
    tags:            data.tags,
    metaDescription: data.metaDescription,
    readTime:        data.readTime,
    seoKeywords:     data.seoKeywords,
    author:          "ParagonSoftBlogs Editorial Team",
    views:           0,
    likes:           0,
  });

  console.log(`[blogGenerator] ✅ Saved: "${data.title}" [${data.category}]`);
  return blog;
}

// ── Main: Generate one blog for a category ────────────────────────────────────
export async function generateOneBlog(
  category: Category
): Promise<{ success: boolean; title?: string; error?: string }> {
  console.log(`[blogGenerator] 🚀 Generating ${category} blog...`);

  try {
    const existingTitles = await getExistingTitles(category);
    console.log(`[blogGenerator] Found ${existingTitles.length} existing ${category} blogs`);

    const blogData  = await generateBlogContent(category, existingTitles);
    console.log(`[blogGenerator] 📝 Generated: "${blogData.title}"`);

    // Step 2.5 — dedicated content-aware image prompt (overrides generic inline prompt)
    const imagePrompt = await generateImagePrompt(blogData);

    const coverImage = await generateCoverImage(imagePrompt, blogData.slug);
    console.log(`[blogGenerator] 🖼️  Cover image: ${coverImage ? "✅" : "⚠️ skipped"}`);

    await saveBlog(blogData, coverImage);

    return { success: true, title: blogData.title };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[blogGenerator] ❌ Failed for ${category}:`, message);
    return { success: false, error: message };
  }
}

// ── Main: Generate all 4 daily blogs ─────────────────────────────────────────
export async function generateDailyBlogs(): Promise<void> {
  console.log("[blogGenerator] 🌅 Starting daily blog generation — 4 blogs scheduled...");

  const categories: Category[] = ["Tech", "Movies", "Health", "Sports"];
  const results = [];

  for (const category of categories) {
    const result = await generateOneBlog(category);
    results.push({ category, ...result });

    // Small delay between generations to respect rate limits
    if (category !== "Sports") {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed    = results.filter((r) => !r.success).length;

  console.log(`[blogGenerator] 🏁 Daily generation complete: ${succeeded} succeeded, ${failed} failed`);
  results.forEach((r) => {
    if (r.success) console.log(`  ✅ ${r.category}: "${r.title}"`);
    else           console.log(`  ❌ ${r.category}: ${r.error}`);
  });
}
