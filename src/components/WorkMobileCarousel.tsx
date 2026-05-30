"use client";

import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { WorkScrollCarousel } from "@/components/WorkScrollCarousel";
import { WorkSwipeCarousel } from "@/components/WorkSwipeCarousel";

/** Phone slot: swipe on touch, scroll on fine pointer (mouse/trackpad). */
export function WorkMobileCarousel() {
  const coarse = useCoarsePointer();
  return coarse ? <WorkSwipeCarousel /> : <WorkScrollCarousel />;
}
