import mongoose, { Document, Schema } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  category: "Tech" | "Movies" | "Health" | "Sports";
  content: string;         // Full HTML blog content
  excerpt: string;         // Short summary (150-160 chars for SEO)
  coverImage: string;      // Cloudinary URL
  tags: string[];
  metaDescription: string; // SEO meta description
  readTime: string;        // e.g. "8 min read"
  views: number;
  likes: number;
  author: string;
  seoKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Tech", "Movies", "Health", "Sports"],
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 200,
    },
    coverImage: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    metaDescription: {
      type: String,
      required: true,
      maxlength: 160,
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    author: {
      type: String,
      default: "ParagonSoftBlogs Editorial Team",
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast category queries
BlogSchema.index({ category: 1, createdAt: -1 });

// Prevent model re-compilation during hot-reload
const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
