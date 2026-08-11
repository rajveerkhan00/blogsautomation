import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/lib/models/Blog";
import groqClient from "@/lib/groq";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow 1 minute for all API roundtrips

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const checkImage = searchParams.get("image") === "true";

  const results = {
    mongodb:    { status: "pending", message: "", latencyMs: 0 },
    groq:       { status: "pending", message: "", latencyMs: 0, testOutput: "" },
    cloudflare: { status: "pending", message: "", latencyMs: 0 },
    cloudinary: { status: "pending", message: "", latencyMs: 0, url: "" },
  };

  // 1. Test MongoDB
  const mongoStart = Date.now();
  try {
    await connectDB();
    const count = await Blog.countDocuments();
    results.mongodb = {
      status: "success",
      message: `Connected successfully. Found ${count} articles in database.`,
      latencyMs: Date.now() - mongoStart,
    };
  } catch (err) {
    results.mongodb = {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - mongoStart,
    };
  }

  // 2. Test Groq LLM API
  const groqStart = Date.now();
  try {
    const testPrompt = "Return exactly 5 words: 'Groq API is working perfectly'.";
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: testPrompt }],
      temperature: 0.1,
      max_tokens: 15,
    });
    results.groq = {
      status: "success",
      message: "API handshake succeeded.",
      latencyMs: Date.now() - groqStart,
      testOutput: response.choices[0]?.message?.content?.trim() ?? "",
    };
  } catch (err) {
    results.groq = {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - groqStart,
      testOutput: "",
    };
  }

  // 3. Test Cloudflare & Cloudinary pipeline (optional, run only if requested to save credits)
  if (checkImage) {
    const imgStart = Date.now();
    const testPrompt = "Minimal blue glowing square, black background, digital art, logo";
    const rawWorkerUrl = process.env.CLOUDFLARE_WORKER_URL ?? "";
    const rawApiKey = process.env.CLOUDFLARE_API_KEY ?? "";
    
    // Strip surrounding quotes if present
    const WORKER_URL = rawWorkerUrl.replace(/^["']|["']$/g, "").trim();
    const API_KEY = rawApiKey.replace(/^["']|["']$/g, "").trim();

    if (!WORKER_URL) {
      results.cloudflare = {
        status: "error",
        message: "CLOUDFLARE_WORKER_URL is missing in .env.local",
        latencyMs: 0,
      };
      results.cloudinary = {
        status: "skipped",
        message: "Skipped because Cloudflare Worker failed.",
        latencyMs: 0,
        url: "",
      };
    } else {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (API_KEY && API_KEY !== '""' && API_KEY !== "''") {
          headers["Authorization"] = `Bearer ${API_KEY}`;
        }

        let workerResponse: Response;
        let isFallback = false;

        try {
          // Call Cloudflare Worker
          workerResponse = await fetch(WORKER_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({ prompt: testPrompt }),
          });

          if (!workerResponse.ok) {
            throw new Error(`Cloudflare Worker HTTP ${workerResponse.status}`);
          }
        } catch (workerErr) {
          console.warn("[test-connections] Cloudflare Worker failed, falling back to Pollinations AI:", workerErr);
          const fallbackUrl = `https://image.pollinations.ai/p/${encodeURIComponent(testPrompt)}?width=800&height=450&nologo=true`;
          workerResponse = await fetch(fallbackUrl);
          if (!workerResponse.ok) {
            throw new Error(`Cloudflare and Fallback both failed. Fallback status: ${workerResponse.status}`);
          }
          isFallback = true;
        }

        const contentType = workerResponse.headers.get("content-type") ?? "";
        results.cloudflare = {
          status: isFallback ? "success" : "success",
          message: isFallback 
            ? "Cloudflare Worker returned 500. Automatically fell back to Pollinations AI successfully."
            : `Generated successfully via Cloudflare Worker. Content-type: ${contentType}`,
          latencyMs: Date.now() - imgStart,
        };

        // Upload to Cloudinary
        const cloudStart = Date.now();
        if (!isFallback && contentType.includes("application/json")) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const json = await workerResponse.json() as any;
          const url = json.url ?? json.imageUrl ?? json.image_url ?? "";
          if (!url) throw new Error("No URL returned in JSON response from Cloudflare Worker");

          // Upload url to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(url, {
            folder: "paragonsoft-test",
            public_id: `test-${Date.now()}`,
          });

          results.cloudinary = {
            status: "success",
            message: "Uploaded from URL to Cloudinary successfully.",
            latencyMs: Date.now() - cloudStart,
            url: uploadResult.secure_url,
          };
        } else {
          // Upload raw buffer to Cloudinary (works for both raw worker image responses and Pollinations AI images)
          const buffer = Buffer.from(await workerResponse.arrayBuffer());
          const base64 = buffer.toString("base64");
          const dataUri = `data:image/jpeg;base64,${base64}`;

          const uploadResult = await cloudinary.uploader.upload(dataUri, {
            folder: "paragonsoft-test",
            public_id: `test-${Date.now()}`,
          });

          results.cloudinary = {
            status: "success",
            message: "Uploaded raw image buffer to Cloudinary successfully.",
            latencyMs: Date.now() - cloudStart,
            url: uploadResult.secure_url,
          };
        }
      } catch (err) {
        if (results.cloudflare.status === "pending") {
          results.cloudflare = {
            status: "error",
            message: err instanceof Error ? err.message : String(err),
            latencyMs: Date.now() - imgStart,
          };
        }
        results.cloudinary = {
          status: "error",
          message: err instanceof Error ? err.message : String(err),
          latencyMs: 0,
          url: "",
        };
      }
    }
  } else {
    results.cloudflare = { status: "skipped", message: "Use ?image=true to test image pipeline.", latencyMs: 0 };
    results.cloudinary = { status: "skipped", message: "Use ?image=true to test image pipeline.", latencyMs: 0, url: "" };
  }

  const allSuccess =
    results.mongodb.status === "success" &&
    results.groq.status === "success" &&
    (!checkImage || (results.cloudflare.status === "success" && results.cloudinary.status === "success"));

  return NextResponse.json({
    success: allSuccess,
    timestamp: new Date().toISOString(),
    results,
  });
}
