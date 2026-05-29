"use client";

import { useState } from "react";
import { WorkCard } from "@/components/WorkCard";
import { WORK_ITEMS } from "@/lib/work-items";

/** Figma artboard 2888:70 — width / height */
const SCATTER_ASPECT = 2462 / 1769;

const HOVER_Z_INDEX = 100;

/** Soft ease-out — gentle start and settle (not abrupt ease-out) */
const HOVER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const HOVER_DURATION_MS = 650;

function cardTransform(isHovered: boolean, rotateDeg: number): string {
  if (isHovered) {
    return "translate3d(0,-1.5rem,0) rotate(0deg) scale(1.04)";
  }
  return `rotate(${rotateDeg}deg)`;
}

export function WorkScatterGrid() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <ul
      className="relative m-0 w-full min-h-[min(72vw,560px)] list-none overflow-visible p-0 sm:min-h-0"
      style={{ aspectRatio: SCATTER_ASPECT }}
    >
      {WORK_ITEMS.map((item) => {
        const isHovered = hoveredId === item.id;

        return (
          <li
            key={item.id}
            className={`absolute origin-center transform-gpu overflow-visible will-change-transform ${
              isHovered
                ? "shadow-[0_24px_56px_rgba(0,0,0,0.2)]"
                : "shadow-none"
            }`}
            style={{
              left: item.scatter.left,
              top: item.scatter.top,
              width: item.scatter.width,
              zIndex: isHovered ? HOVER_Z_INDEX : item.scatter.zIndex,
              transform: cardTransform(isHovered, item.scatter.rotateDeg),
              transition: `transform ${HOVER_DURATION_MS}ms ${HOVER_EASE}, box-shadow ${HOVER_DURATION_MS}ms ${HOVER_EASE}`,
            }}
            tabIndex={0}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(item.id)}
            onBlur={() => setHoveredId(null)}
          >
            <WorkCard title={item.title} />
          </li>
        );
      })}
    </ul>
  );
}
