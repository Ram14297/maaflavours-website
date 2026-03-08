// src/app/blog/PostCard.tsx
// Maa Flavours — Blog Post Card component (extracted to avoid client/server conflict)

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import {
  formatBlogDate,
  CATEGORY_CONFIG,
  type BlogPost,
} from "@/lib/constants/blog";

export function PostCard({ post }: { post: BlogPost }) {
  const cat = CATEGORY_CONFIG[post.category];
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col">
      <article
        className="flex flex-col flex-1 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
        style={{
          background: "white",
          border: "1px solid rgba(200,150,12,0.12)",
          boxShadow: "0 2px 12px rgba(74,44,10,0.05)",
        }}
      >
        {/* Card image placeholder */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            aspectRatio: "16/9",
            background: "linear-gradient(135deg,var(--color-cream) 0%,#EDE3C8 100%)",
          }}
        >
          {/* REPLACE with actual blog post image */}
          <span className="text-6xl transition-transform duration-300 group-hover:scale-110">
            {post.emoji}
          </span>

          {/* Category badge */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full font-dm-sans text-xs font-bold"
            style={{
              background: "rgba(255,255,255,0.92)",
              color: cat.color,
              border: `1px solid ${cat.color}22`,
              backdropFilter: "blur(4px)",
            }}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </div>
        </div>

        {/* Gold ornament */}
        <div
          className="h-[2px]"
          style={{
            background:
              "linear-gradient(90deg,transparent,var(--color-gold) 25%,var(--color-gold-light) 50%,var(--color-gold) 75%,transparent)",
          }}
        />

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h3
            className="font-playfair font-bold text-lg leading-snug mb-2 transition-colors group-hover:text-crimson"
            style={{ color: "var(--color-brown)" }}
          >
            {post.title}
          </h3>
          <p
            className="font-cormorant italic text-base leading-snug mb-4 flex-1"
            style={{ color: "var(--color-grey)" }}
          >
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between mt-auto pt-3 border-t"
            style={{ borderColor: "rgba(200,150,12,0.08)" }}>
            <div className="flex items-center gap-1.5" style={{ color: "var(--color-grey)" }}>
              <Clock size={12} />
              <span className="font-dm-sans text-xs">{post.readTime}</span>
              <span className="mx-1 opacity-30">·</span>
              <span className="font-dm-sans text-xs">{formatBlogDate(post.publishedAt)}</span>
            </div>
            <span
              className="font-dm-sans text-xs font-bold flex items-center gap-1 transition-all duration-200 group-hover:gap-2"
              style={{ color: "var(--color-crimson)" }}
            >
              Read <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
