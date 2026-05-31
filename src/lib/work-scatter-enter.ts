import type { WorkItem } from "@/lib/work-items";

/** Figma artboard 2888:70 — width / height */
const SCATTER_ASPECT = 2462 / 1769;

export type ScatterEnterFrom = "top" | "right" | "bottom" | "left";

/** Compass entry by scatter z-index (1 = back of pile … 5 = front). */
const ENTER_FROM_BY_Z_INDEX: Record<number, ScatterEnterFrom> = {
  1: "top",
  2: "left",
  3: "top",
  4: "right",
  5: "bottom",
};

const ENTER_DISTANCE_X = 120;
const ENTER_DISTANCE_Y = 120;

function parsePercent(value: string): number {
  return parseFloat(value.replace("%", ""));
}

/** Start offset (% of scatter canvas) before slide-in on load. */
export function getScatterEnterOffset(item: WorkItem): { dx: number; dy: number } {
  const direction = ENTER_FROM_BY_Z_INDEX[item.scatter.zIndex] ?? "top";
  const width = parsePercent(item.scatter.width);
  const height = width * (3 / 4) * SCATTER_ASPECT;

  switch (direction) {
    case "top":
      return { dx: 0, dy: -(height + ENTER_DISTANCE_Y) };
    case "bottom":
      return { dx: 0, dy: height + ENTER_DISTANCE_Y };
    case "left":
      return { dx: -(width + ENTER_DISTANCE_X), dy: 0 };
    case "right":
      return { dx: width + ENTER_DISTANCE_X, dy: 0 };
  }
}
