"use client";

import { useState, useEffect, useCallback } from "react";

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  category: "Tech" | "Movies" | "Health" | "Sports";
  excerpt: string;
  coverImage: string;
  tags: string[];
  metaDescription: string;
  readTime: string;
  views: number;
  likes: number;
  author: string;
  createdAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

interface UseBlogsOptions {
  category?: string;
  limit?: number;
  page?: number;
  sort?: "newest" | "oldest" | "popular";
}

interface UseBlogsResult {
  blogs: BlogPost[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBlogs(options: UseBlogsOptions = {}): UseBlogsResult {
  const { category, limit = 12, page = 1, sort = "newest" } = options;

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    params.set("limit", String(limit));
    params.set("page", String(page));
    params.set("sort", sort);

    fetch(`/api/blogs?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { blogs: BlogPost[]; pagination: PaginationInfo }) => {
        if (!cancelled) {
          setBlogs(data.blogs ?? []);
          setPagination(data.pagination ?? null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [category, limit, page, sort, tick]);

  return { blogs, pagination, isLoading, error, refetch };
}
