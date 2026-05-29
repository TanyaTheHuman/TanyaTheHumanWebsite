/** Positioning matched to Figma node 2888:70 (2462×1769 artboard) */
export type WorkItemScatter = {
  left: string;
  top: string;
  width: string;
  /** Rotation in degrees (scattered resting pose) */
  rotateDeg: number;
  zIndex: number;
};

export type WorkItem = {
  id: string;
  title: string;
  year: number | string;
  scatter: WorkItemScatter;
  /** Reserved for /work/[slug] detail pages later */
  slug?: string;
};

export const WORK_ITEMS: WorkItem[] = [
  {
    id: "deliveroo",
    slug: "deliveroo",
    title: "Deliveroo",
    year: 2024,
    scatter: {
      left: "31.7%",
      top: "11.2%",
      width: "36%",
      rotateDeg: -9.07,
      zIndex: 1,
    },
  },
  {
    id: "vipps",
    slug: "vipps",
    title: "Vipps",
    year: 2022,
    scatter: {
      left: "10.4%",
      top: "36.5%",
      width: "34.4%",
      rotateDeg: -4.81,
      zIndex: 2,
    },
  },
  {
    id: "crossword-site",
    slug: "crossword-site",
    title: "Tanya, the human",
    year: 2025,
    scatter: {
      left: "58.5%",
      top: "18%",
      width: "35.6%",
      rotateDeg: 8.1,
      zIndex: 3,
    },
  },
  {
    id: "tinkering",
    slug: "tinkering",
    title: "Side project",
    year: "In progress",
    scatter: {
      left: "44.1%",
      top: "41.2%",
      width: "35.6%",
      rotateDeg: 8.1,
      zIndex: 4,
    },
  },
  {
    id: "experiments",
    slug: "experiments",
    title: "Experiments",
    year: 2026,
    scatter: {
      left: "24.8%",
      top: "61.6%",
      width: "36%",
      rotateDeg: -9.07,
      zIndex: 5,
    },
  },
];
