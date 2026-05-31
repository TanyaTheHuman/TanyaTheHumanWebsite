"use client";

import { WorkSwipeCarousel } from "@/components/WorkSwipeCarousel";

/** Mobile breakpoint: swipe pile for touch and mouse (no scroll-jacking). */
export function WorkMobileCarousel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-clip overflow-y-visible">
      <WorkSwipeCarousel />
    </div>
  );
}
