"use client";

import { useEffect, useState, useCallback } from "react";
import throttle from "lodash/throttle";

interface FollowProps {
  title: string;
}

export default function Follow({ title }: FollowProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState<boolean>(false);

  /**
   * Throttled handler to update mouse position.
   * Throttling ensures performance by limiting the number of state updates.
   */
  const handlePointerMove = useCallback(
    throttle((event: PointerEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
      setIsVisible(true); // Ensure visibility when the pointer moves
      // Optional: Remove console logs in production
      console.log("Pointer Position:", event.clientX, event.clientY);
    }, 16), // ~60fps
    [],
  );

  /**
   * Handler to detect when the pointer leaves the viewport.
   * The `relatedTarget` is `null` when the pointer leaves the window.
   */
  const handlePointerOut = useCallback((event: PointerEvent) => {
    if (!event.relatedTarget) {
      setIsVisible(false);
    }
  }, []);

  /**
   * Handler to detect when the pointer enters the viewport.
   */
  const handlePointerOver = useCallback(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Attach pointer event listeners to the document
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerout", handlePointerOut);
    document.addEventListener("pointerover", handlePointerOver);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("pointerover", handlePointerOver);
      handlePointerMove.cancel(); // Cancel any pending throttled calls
    };
  }, [handlePointerMove, handlePointerOut, handlePointerOver]);

  // If the pointer is not visible (i.e., outside the window), don't render the popup
  if (!isVisible) return null;

  return (
    <div
      className="flex items-center justify-center text-maincolor dark:text-purple-600 bg-white/40
      dark:bg-black/40 outline outline-black/40 dark:outline-white/40 z-[9999999] rounded-full px-2 py-1 text-xs"
      style={{
        position: "absolute",
        left: mousePosition.x,
        top: mousePosition.y,
        transform: "translate(0%, -100%)", // Centers the popup on the cursor
        pointerEvents: "none", // Allows mouse events to pass through
        transition: "top 0.05s, left 0.05s", // Smooth movement
        whiteSpace: "nowrap", // Prevents text wrapping
      }}
    >
      {title}
    </div>
  );
}
