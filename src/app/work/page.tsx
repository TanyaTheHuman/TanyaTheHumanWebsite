import type { Metadata } from "next";
import { WorkCard } from "@/components/WorkCard";
import { WORK_ITEMS } from "@/lib/work-items";

export const metadata: Metadata = {
  title: "Work — Tanya, the human",
  description:
    "A selection of product design work and things currently in progress.",
};

export default function WorkPage() {
  return (
    <main className="bg-cream text-ink min-h-screen px-4 py-16 sm:px-8 sm:py-20 lg:px-14">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10">
        <header className="max-w-xl">
          <h1 className="h4 text-stone-800 [font-feature-settings:'dlig'_on,'hlig'_on]">
            Work
          </h1>
          <p className="body-large text-ink mt-4 text-pretty">
            A menu of things I&apos;ve shipped and things I&apos;m tinkering
            with.
          </p>
        </header>

        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {WORK_ITEMS.map((item) => (
            <li key={item.id}>
              <WorkCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
