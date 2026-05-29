import type { Metadata } from "next";
import { WorkScatterGrid } from "@/components/WorkScatterGrid";

export const metadata: Metadata = {
  title: "Work — Tanya, the human",
  description: "Product design work.",
};

export default function WorkPage() {
  return (
    <main className="bg-cream text-ink min-h-screen overflow-visible px-4 py-16 sm:px-8 sm:py-20 lg:px-14">
      <div className="mx-auto w-full max-w-[1200px] overflow-visible">
        <WorkScatterGrid />
      </div>
    </main>
  );
}
