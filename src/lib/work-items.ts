export type WorkItem = {
  id: string;
  title: string;
  year: number | string;
  previewSrc: string;
  previewAlt: string;
  /** Reserved for /work/[slug] detail pages later */
  slug?: string;
};

export const WORK_ITEMS: WorkItem[] = [
  {
    id: "deliveroo",
    slug: "deliveroo",
    title: "Deliveroo",
    year: 2024,
    previewSrc: "/work/deliveroo.png",
    previewAlt: "Deliveroo product design preview",
  },
  {
    id: "vipps",
    slug: "vipps",
    title: "Vipps",
    year: 2022,
    previewSrc: "/work/vipps.png",
    previewAlt: "Vipps product design preview",
  },
  {
    id: "crossword-site",
    slug: "crossword-site",
    title: "Tanya, the human",
    year: 2025,
    previewSrc: "/work/portfolio.png",
    previewAlt: "Personal portfolio site with crossword",
  },
  {
    id: "tinkering",
    slug: "tinkering",
    title: "Side project",
    year: "In progress",
    previewSrc: "/work/tinkering.png",
    previewAlt: "Work in progress preview",
  },
];
