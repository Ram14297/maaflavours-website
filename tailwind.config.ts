// tailwind.config.ts
// Maa Flavours — Brand-specific Tailwind configuration
// Extends default theme with exact brand color palette, fonts, and custom utilities

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Brand Color Palette ─────────────────────────────────────────────
      // DO NOT add colors outside this palette
      colors: {
        crimson: {
          DEFAULT: "#C0272D",
          dark: "#9E1F24",
          light: "#D94045",
        },
        gold: {
          DEFAULT: "#C8960C",
          light: "#E8B84B",
          pale: "#F5DFA0",
          muted: "#A07A0A",
        },
        brown: {
          DEFAULT: "#4A2C0A",
          light: "#6B4226",
          pale: "#8B6343",
        },
        "warm-white": "#FAFAF5",
        cream: {
          DEFAULT: "#F5EFE0",
          dark: "#EDE3CE",
          deeper: "#E0D4BC",
        },
        grey: {
          DEFAULT: "#6B6B6B",
          light: "#9B9B9B",
          pale: "#D4D4D4",
        },
        "badge-red": "#B22222",
        // Spice level badge colors
        spice: {
          mild: "#4A7C59",       // green — mild
          medium: "#B8750A",     // amber — medium
          spicy: "#C0272D",      // crimson — spicy
          "extra-hot": "#7A1515", // dark red — extra hot
        },
        // Vegetarian indicator
        veg: "#2E7D32",
      },

      // ─── Brand Typography ─────────────────────────────────────────────────
      fontFamily: {
        // Headings — warm, serif, premium editorial
        playfair: ["Playfair Display", "Georgia", "serif"],
        // Subheadings — elegant, slightly condensed serif
        cormorant: ["Cormorant Garamond", "Georgia", "serif"],
        // Body — clean, modern, highly readable
        "dm-sans": ["DM Sans", "system-ui", "sans-serif"],
        // Decorative — only for short brand moments
        dancing: ["Dancing Script", "cursive"],
      },

      // ─── Font Sizes — Fluid Typography Scale ──────────────────────────────
      fontSize: {
        "display-xl": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2rem, 4.5vw, 3.5rem)", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(1.75rem, 3.5vw, 2.75rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "heading-lg": ["clamp(1.5rem, 2.5vw, 2.25rem)", { lineHeight: "1.25" }],
        "heading-md": ["clamp(1.25rem, 2vw, 1.75rem)", { lineHeight: "1.3" }],
        "heading-sm": ["clamp(1.1rem, 1.5vw, 1.375rem)", { lineHeight: "1.4" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
        "body-md": ["1rem", { lineHeight: "1.7" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6" }],
        "caption": ["0.8125rem", { lineHeight: "1.5" }],
      },

      // ─── Spacing ──────────────────────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "section": "clamp(4rem, 8vw, 7rem)",
      },

      // ─── Border Radius ────────────────────────────────────────────────────
      borderRadius: {
        "card": "12px",
        "card-lg": "16px",
        "pill": "999px",
      },

      // ─── Box Shadows — warm, earthy depth ─────────────────────────────────
      boxShadow: {
        "card": "0 2px 16px rgba(74, 44, 10, 0.08), 0 1px 4px rgba(74, 44, 10, 0.04)",
        "card-hover": "0 8px 32px rgba(74, 44, 10, 0.14), 0 2px 8px rgba(74, 44, 10, 0.06)",
        "gold-glow": "0 0 0 2px rgba(200, 150, 12, 0.35), 0 4px 16px rgba(200, 150, 12, 0.15)",
        "crimson-glow": "0 0 0 2px rgba(192, 39, 45, 0.3), 0 4px 16px rgba(192, 39, 45, 0.12)",
        "nav": "0 4px 24px rgba(74, 44, 10, 0.08)",
        "modal": "0 24px 80px rgba(74, 44, 10, 0.18), 0 8px 32px rgba(74, 44, 10, 0.1)",
        "btn": "0 2px 8px rgba(192, 39, 45, 0.3)",
        "btn-gold": "0 2px 8px rgba(200, 150, 12, 0.3)",
        "inner-warm": "inset 0 2px 8px rgba(74, 44, 10, 0.06)",
      },

      // ─── Background Images / Gradients ────────────────────────────────────
      backgroundImage: {
        // Subtle warm linen texture via CSS gradient (no image needed)
        "linen-texture": `
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23FAFAF5'/%3E%3Crect width='1' height='1' x='0' y='0' fill='%23F0EAD8' opacity='0.4'/%3E%3Crect width='1' height='1' x='2' y='2' fill='%23EDE3CE' opacity='0.3'/%3E%3C/svg%3E")
        `,
        // Crimson gradient for CTAs and hero accents
        "crimson-gradient": "linear-gradient(135deg, #C0272D 0%, #9E1F24 100%)",
        // Gold gradient for ornamental elements
        "gold-gradient": "linear-gradient(135deg, #E8B84B 0%, #C8960C 50%, #A07A0A 100%)",
        // Hero section warm gradient
        "hero-gradient": "linear-gradient(135deg, #FAFAF5 0%, #F5EFE0 40%, #EDE3CE 100%)",
        // Footer dark gradient
        "footer-gradient": "linear-gradient(180deg, #3A2006 0%, #2A1804 100%)",
        // Section cream gradient
        "cream-gradient": "linear-gradient(180deg, #FAFAF5 0%, #F5EFE0 100%)",
      },

      // ─── Animation ────────────────────────────────────────────────────────
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-up": "fadeUp 0.7s ease-out forwards",
        "fade-up-slow": "fadeUp 1s ease-out forwards",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
        "slide-in-left": "slideInLeft 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "shimmer": "shimmer 2s infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "marquee": "marquee 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(200, 150, 12, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(200, 150, 12, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },

      // ─── Transition Timing ────────────────────────────────────────────────
      transitionTimingFunction: {
        "brand": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "bounce-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      // ─── Z-Index Scale ────────────────────────────────────────────────────
      zIndex: {
        "announcement": "60",
        "nav": "50",
        "cart-drawer": "55",
        "modal": "70",
        "toast": "80",
        "whatsapp": "45",
      },

      // ─── Max Widths ───────────────────────────────────────────────────────
      maxWidth: {
        "site": "1280px",
        "content": "860px",
        "narrow": "640px",
        "otp-card": "420px",
      },

      // ─── Screen breakpoints (mobile-first) ───────────────────────────────
      screens: {
        "xs": "375px",
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1440px",
      },
    },
  },
  plugins: [
    // Custom plugin for CSS variables and utilities
    function ({ addBase, addComponents, addUtilities, theme }: any) {
      // ─── CSS Custom Properties ─────────────────────────────────────────
      addBase({
        ":root": {
          "--color-crimson": theme("colors.crimson.DEFAULT"),
          "--color-crimson-dark": theme("colors.crimson.dark"),
          "--color-gold": theme("colors.gold.DEFAULT"),
          "--color-gold-light": theme("colors.gold.light"),
          "--color-brown": theme("colors.brown.DEFAULT"),
          "--color-warm-white": theme("colors.warm-white"),
          "--color-cream": theme("colors.cream.DEFAULT"),
          "--color-grey": theme("colors.grey.DEFAULT"),
          "--color-badge-red": theme("colors.badge-red"),
          "--font-playfair": "'Playfair Display', Georgia, serif",
          "--font-cormorant": "'Cormorant Garamond', Georgia, serif",
          "--font-dm-sans": "'DM Sans', system-ui, sans-serif",
          "--font-dancing": "'Dancing Script', cursive",
          "--transition-brand": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        },
      });

      // ─── Reusable Component Classes ──────────────────────────────────────
      addComponents({
        // Gold ornamental divider line
        ".ornament-gold": {
          display: "block",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #C8960C 20%, #E8B84B 50%, #C8960C 80%, transparent)",
          border: "none",
          margin: "0 auto",
        },
        // Gold ornamental thin divider
        ".ornament-gold-thin": {
          display: "block",
          height: "1px",
          background: "linear-gradient(90deg, transparent, #C8960C 20%, #E8B84B 50%, #C8960C 80%, transparent)",
          border: "none",
        },
        // Product card base
        ".product-card": {
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 16px rgba(74, 44, 10, 0.08), 0 1px 4px rgba(74, 44, 10, 0.04)",
          border: "1px solid rgba(200, 150, 12, 0.15)",
          transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          overflow: "hidden",
          position: "relative",
          "&:hover": {
            boxShadow: "0 8px 32px rgba(74, 44, 10, 0.14), 0 0 0 2px rgba(200, 150, 12, 0.3)",
            transform: "translateY(-4px)",
          },
        },
        // Primary CTA button
        ".btn-primary": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.75rem 2rem",
          backgroundColor: "#C0272D",
          color: "white",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: "600",
          fontSize: "0.9375rem",
          letterSpacing: "0.02em",
          borderRadius: "8px",
          border: "2px solid transparent",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(192, 39, 45, 0.3)",
          transition: "all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          "&:hover": {
            backgroundColor: "#9E1F24",
            boxShadow: "0 4px 16px rgba(192, 39, 45, 0.4)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: "0 1px 4px rgba(192, 39, 45, 0.2)",
          },
          "&:disabled": {
            opacity: "0.55",
            cursor: "not-allowed",
            transform: "none",
          },
        },
        // Ghost / outline button
        ".btn-ghost": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.75rem 2rem",
          backgroundColor: "transparent",
          color: "#C0272D",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: "600",
          fontSize: "0.9375rem",
          letterSpacing: "0.02em",
          borderRadius: "8px",
          border: "2px solid #C0272D",
          cursor: "pointer",
          transition: "all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          "&:hover": {
            backgroundColor: "rgba(192, 39, 45, 0.06)",
            boxShadow: "0 2px 8px rgba(192, 39, 45, 0.15)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        // Gold accent button
        ".btn-gold": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.75rem 2rem",
          background: "linear-gradient(135deg, #E8B84B 0%, #C8960C 50%, #A07A0A 100%)",
          color: "white",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: "600",
          fontSize: "0.9375rem",
          letterSpacing: "0.02em",
          borderRadius: "8px",
          border: "2px solid transparent",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(200, 150, 12, 0.3)",
          transition: "all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(200, 150, 12, 0.45)",
            transform: "translateY(-1px)",
          },
        },
        // Brand section container
        ".section-container": {
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.25rem",
          "@screen sm": { padding: "0 1.5rem" },
          "@screen lg": { padding: "0 2rem" },
          "@screen xl": { padding: "0 2.5rem" },
        },
        // Section vertical spacing
        ".section-padding": {
          paddingTop: "clamp(4rem, 8vw, 7rem)",
          paddingBottom: "clamp(4rem, 8vw, 7rem)",
        },
        // Warm linen paper texture background
        ".bg-texture": {
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")
          `,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        },
        // Card with gold ornamental top border
        ".card-ornate": {
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 16px rgba(74, 44, 10, 0.08)",
          border: "1px solid rgba(200, 150, 12, 0.2)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, transparent, #C8960C 20%, #E8B84B 50%, #C8960C 80%, transparent)",
          },
        },
        // OTP input box
        ".otp-input": {
          width: "3rem",
          height: "3.5rem",
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: "700",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          color: "#4A2C0A",
          backgroundColor: "#FAFAF5",
          border: "2px solid rgba(200, 150, 12, 0.3)",
          borderRadius: "10px",
          transition: "all 0.2s ease",
          "&:focus": {
            outline: "none",
            borderColor: "#C8960C",
            boxShadow: "0 0 0 3px rgba(200, 150, 12, 0.2)",
            backgroundColor: "white",
          },
          "&:not(:placeholder-shown)": {
            borderColor: "#C0272D",
            backgroundColor: "rgba(192, 39, 45, 0.04)",
          },
          "@screen sm": { width: "3.5rem", height: "4rem" },
        },
        // Gold corner ornament for cards
        ".corner-ornament": {
          position: "absolute",
          width: "24px",
          height: "24px",
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            backgroundColor: "#C8960C",
          },
          "&::before": { width: "2px", height: "100%" },
          "&::after": { width: "100%", height: "2px" },
        },
        // Spice level badge
        ".badge-spice": {
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.25rem 0.625rem",
          borderRadius: "999px",
          fontSize: "0.75rem",
          fontWeight: "600",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          letterSpacing: "0.04em",
        },
        // Vegetarian dot badge
        ".veg-badge": {
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          "&::before": {
            content: '""',
            display: "block",
            width: "12px",
            height: "12px",
            borderRadius: "2px",
            border: "1.5px solid #2E7D32",
            backgroundColor: "transparent",
            position: "relative",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#2E7D32",
          },
        },
        // Heading with gold underline accent
        ".heading-accent": {
          position: "relative",
          display: "inline-block",
          paddingBottom: "0.5rem",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "3px",
            background: "linear-gradient(90deg, #C8960C, #E8B84B, #C8960C)",
            borderRadius: "2px",
          },
        },
        // Scrollbar styling (webkit)
        ".scrollbar-brand": {
          "&::-webkit-scrollbar": { width: "6px", height: "6px" },
          "&::-webkit-scrollbar-track": { backgroundColor: "#F5EFE0" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#C8960C",
            borderRadius: "3px",
            "&:hover": { backgroundColor: "#A07A0A" },
          },
        },
      });

      // ─── Custom Utilities ─────────────────────────────────────────────────
      addUtilities({
        ".text-balance": { textWrap: "balance" },
        ".text-pretty": { textWrap: "pretty" },
        ".writing-mode-vertical": { writingMode: "vertical-rl" },
        ".backface-hidden": { backfaceVisibility: "hidden" },
        ".perspective-1000": { perspective: "1000px" },
        ".border-gold-ornament": {
          borderImage: "linear-gradient(90deg, transparent, #C8960C, #E8B84B, #C8960C, transparent) 1",
        },
        ".mask-fade-bottom": {
          maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
          "-webkit-mask-image": "linear-gradient(to bottom, black 70%, transparent 100%)",
        },
      });
    },
  ],
};

export default config;
