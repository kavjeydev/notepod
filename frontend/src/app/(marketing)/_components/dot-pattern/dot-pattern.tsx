"use client";

import DotPattern from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export function DotPatternDemo() {
  return (
    <div className="absolute flex h-[500px] w-full flex-col items-center justify-center overflow-hidden z-0">
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)] ",
        )}
      />
    </div>
  );
}
