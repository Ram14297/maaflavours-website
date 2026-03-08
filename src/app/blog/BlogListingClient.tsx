"use client";
// src/app/blog/BlogListingClient.tsx
// Maa Flavours — Blog Listing Client Component
// Handles interactive category filtering with tab UI
// Receives all posts from the server component (no fetch needed)

import { useState, useMemo } from "react";
import { PostCard } from "./page";
import { CATEGORY_CONFIG, type BlogPost, type PostCategory } from "@/lib/constants/blog";

interface Props {
  posts: BlogPost[];
}

const ALL_CATEGORIES = ["all", "recipe", "tips", "culture", "health", "behind-the-scenes"] as const;
type FilterValue = typeof ALL_CATEGORIES[number];

export default function BlogListingClient({ posts }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    if (activeFilter === "all") return posts;
    return posts.filter((p) => p.category === activeFilter);
  }, [posts, activeFilter]);

  return (
    <div>
      {/* ── Section heading ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2
            className="font-playfair font-bold text-2xl sm:text-3xl"
            style={{ color: "var(--color-brown)" }}
          >
            All Stories
          </h2>
          <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            {activeFilter !== "all" && ` in ${CATEGORY_CONFIG[activeFilter as PostCategory]?.label}`}
          </p>
        </div>
      </div>

      {/* ── Category filter tabs ─────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-8">
        {/* All tab */}
        <button
          onClick={() => setActiveFilter("all")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full font-dm-sans text-sm font-semibold transition-all duration-200"
          style={{
            background: activeFilter === "all" ? "var(--color-brown)" : "white",
            color: activeFilter === "all" ? "white" : "var(--color-grey)",
            border: `1.5px solid ${activeFilter === "all" ? "var(--color-brown)" : "rgba(200,150,12,0.2)"}`,
            boxShadow: activeFilter === "all" ? "0 2px 8px rgba(74,44,10,0.2)" : "none",
          }}
        >
          🫙 All Posts
        </button>

        {/* Category tabs */}
        {ALL_CATEGORIES.filter((c) => c !== "all").map((cat) => {
          const config = CATEGORY_CONFIG[cat as PostCategory];
          const isActive = activeFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-dm-sans text-sm font-semibold transition-all duration-200"
              style={{
                background: isActive ? config.color : "white",
                color: isActive ? "white" : config.color,
                border: `1.5px solid ${isActive ? config.color : `${config.color}40`}`,
                boxShadow: isActive ? `0 2px 8px ${config.color}40` : "none",
              }}
            >
              <span>{config.emoji}</span>
              {config.label}
            </button>
          );
        })}
      </div>

      {/* ── Ornament line ────────────────────────────────────────── */}
      <div
        className="h-px mb-8"
        style={{
          background:
            "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
        }}
      />

      {/* ── Post grid ────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-4">
          <span className="text-5xl">🫙</span>
          <h3
            className="font-playfair font-bold text-xl"
            style={{ color: "var(--color-brown)" }}
          >
            No posts in this category yet
          </h3>
          <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
            Check back soon — more stories from our Ongole kitchen are coming!
          </p>
          <button
            onClick={() => setActiveFilter("all")}
            className="font-dm-sans text-sm font-semibold px-5 py-2.5 rounded-xl transition-opacity hover:opacity-70"
            style={{
              border: "1.5px solid var(--color-brown)",
              color: "var(--color-brown)",
            }}
          >
            View all posts
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
