import Image from "next/image";
import type { WorkItem } from "@/lib/work-items";

type WorkCardProps = {
  item: WorkItem;
};

export function WorkCard({ item }: WorkCardProps) {
  return (
    <article
      className="border-stone-400 bg-cream flex flex-col overflow-hidden border transition-colors duration-150 hover:border-stone-500"
      aria-labelledby={`work-title-${item.id}`}
    >
      <div className="border-stone-400 relative aspect-[4/3] w-full border-b">
        <Image
          src={item.previewSrc}
          alt={item.previewAlt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex items-baseline justify-between gap-3 px-4 py-3">
        <h2
          id={`work-title-${item.id}`}
          className="body-default-bold text-ink min-w-0 [font-feature-settings:'dlig'_on]"
        >
          {item.title}
        </h2>
        <p className="caption shrink-0 text-stone-600">{item.year}</p>
      </div>
    </article>
  );
}
