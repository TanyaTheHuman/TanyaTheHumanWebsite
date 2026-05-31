/** Positioning matched to Figma node 2888:70 (2462×1769 artboard) */
export type WorkItemScatter = {
  left: string;
  top: string;
  width: string;
  /** Rotation in degrees (scattered resting pose) */
  rotateDeg: number;
  zIndex: number;
};

/** All scatter cards share one Figma frame size (% of artboard width). */
const SCATTER_CARD_WIDTH = "36%";

export type WorkItem = {
  id: string;
  year: number | string;
  scatter: WorkItemScatter;
  /** Reserved for /work/[slug] detail pages later */
  slug?: string;
};

export const WORK_ITEMS: WorkItem[] = [
  {
    id: "deliveroo",
    slug: "deliveroo",
    year: 2024,
    scatter: {
      left: "31.7%",
      top: "11.2%",
      width: SCATTER_CARD_WIDTH,
      rotateDeg: -9.07,
      zIndex: 1,
    },
  },
  {
    id: "vipps",
    slug: "vipps",
    year: 2022,
    scatter: {
      left: "10.4%",
      top: "36.5%",
      width: SCATTER_CARD_WIDTH,
      rotateDeg: -4.81,
      zIndex: 2,
    },
  },
  {
    id: "crossword-site",
    slug: "crossword-site",
    year: 2025,
    scatter: {
      left: "58.5%",
      top: "18%",
      width: SCATTER_CARD_WIDTH,
      rotateDeg: 8.1,
      zIndex: 3,
    },
  },
  {
    id: "tinkering",
    slug: "tinkering",
    year: "In progress",
    scatter: {
      left: "44.1%",
      top: "41.2%",
      width: SCATTER_CARD_WIDTH,
      rotateDeg: 8.1,
      zIndex: 4,
    },
  },
  {
    id: "experiments",
    slug: "experiments",
    year: 2026,
    scatter: {
      left: "24.8%",
      top: "61.6%",
      width: SCATTER_CARD_WIDTH,
      rotateDeg: -9.07,
      zIndex: 5,
    },
  },
];

/** 1 = front of scatter pile (highest z-index), counting back through the stack. */
export function getWorkStackNumber(item: WorkItem): number {
  return WORK_ITEMS.length + 1 - item.scatter.zIndex;
}

export function getWorkCardLabel(item: WorkItem): string {
  return `Card ${getWorkStackNumber(item)}`;
}
