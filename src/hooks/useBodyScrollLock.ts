"use client";
// src/hooks/useBodyScrollLock.ts
// Maa Flavours — iOS-safe body scroll lock
//
// Plain `document.body.style.overflow = "hidden"` does NOT work on iOS Safari.
// The page still elastically scrolls behind modals (rubber-band bounce).
//
// The correct fix: set `position: fixed` on the body while saving the current
// scroll offset in `top`. When the modal closes, reset and restore scroll.
// `overflowY: scroll` keeps the desktop scrollbar visible so the layout
// doesn't shift when the modal opens.

import { useEffect } from "react";

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const body    = document.body;

    body.style.position  = "fixed";
    body.style.top       = `-${scrollY}px`;
    body.style.left      = "0";
    body.style.right     = "0";
    body.style.overflowY = "scroll"; // prevent scrollbar-width layout jump on desktop

    return () => {
      body.style.position  = "";
      body.style.top       = "";
      body.style.left      = "";
      body.style.right     = "";
      body.style.overflowY = "";
      // Restore exact scroll position — instant so the user never notices
      window.scrollTo({ top: scrollY, behavior: "instant" as ScrollBehavior });
    };
  }, [active]);
}
