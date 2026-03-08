// src/components/product/SpiceLevelIndicator.tsx
// Maa Flavours — Visual spice level indicator
// Shows filled dots on a scale of 5, color-coded by spice level

import { getSpiceLevelConfig } from "@/lib/utils";

interface SpiceLevelIndicatorProps {
  level: string;
  showLabel?: boolean;
}

const LEVEL_DOTS: Record<string, number> = {
  mild: 1,
  medium: 2,
  spicy: 4,
  "extra-hot": 5,
};

const LEVEL_COLORS: Record<string, string> = {
  mild: "#4A7C59",
  medium: "#B8750A",
  spicy: "#C0272D",
  "extra-hot": "#7A1515",
};

export default function SpiceLevelIndicator({
  level,
  showLabel = true,
}: SpiceLevelIndicatorProps) {
  const config = getSpiceLevelConfig(level);
  const filledDots = LEVEL_DOTS[level] || 2;
  const color = LEVEL_COLORS[level] || "var(--color-gold)";

  return (
    <div className="flex items-center gap-3">
      {/* Dots */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="block rounded-full transition-all duration-200"
            style={{
              width: "10px",
              height: "10px",
              background: i < filledDots ? color : "rgba(200,150,12,0.15)",
              border: i < filledDots ? `1px solid ${color}` : "1px solid rgba(200,150,12,0.2)",
            }}
          />
        ))}
      </div>

      {/* Badge + label */}
      {showLabel && (
        <span
          className={`badge-spice text-xs font-semibold ${config.className}`}
        >
          {config.emoji} {config.label}
        </span>
      )}
    </div>
  );
}
