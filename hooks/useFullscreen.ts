"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Hook to toggle a full-page overlay mode.
 * Uses position:fixed CSS overlay instead of the browser Fullscreen API,
 * so the timer covers the entire page content while staying in the normal browser window.
 */
export function useFullPage() {
  const [isFullPage, setIsFullPage] = useState(false);

  const toggleFullPage = useCallback(() => {
    setIsFullPage((prev) => !prev);
  }, []);

  // Allow Escape key to exit full-page mode
  useEffect(() => {
    if (!isFullPage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullPage(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullPage]);

  // Prevent body scroll when in full-page mode
  useEffect(() => {
    if (isFullPage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullPage]);

  return { isFullPage, toggleFullPage };
}

