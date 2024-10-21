"use client";

import { useEffect, useState } from "react";

interface FollowProps {
  title: string;
}

export default function Follow({ title }: FollowProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
      console.log("X", event.clientX);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  });

  return (
    <div className="flex absolute bottom-[125px] w-full h-[30px] bg-slate-300 dark:bg-slate-600 z-[99999] items-center justify-center text-muted-foreground">
      Moving {title}
    </div>
  );
}
