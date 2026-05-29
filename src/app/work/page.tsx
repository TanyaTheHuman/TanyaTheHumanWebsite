import type { Metadata } from "next";
import { DevBreakpointMarker } from "@/components/DevBreakpointMarker";
import { WorkScatterGrid } from "@/components/WorkScatterGrid";
import { WorkScrollCarousel } from "@/components/WorkScrollCarousel";

export const metadata: Metadata = {
  title: "Work — Tanya, the human",
  description: "Product design work.",
};

export default function WorkPage() {
  return (
    <main className="bg-cream text-ink min-h-screen md:overflow-x-clip">
      <DevBreakpointMarker />

      {/* Phone: scroll-driven vertical carousel */}
      <div className="md:hidden">
        <WorkScrollCarousel />
      </div>

      {/* Tablet + desktop: scattered pile */}
      <div className="hidden overflow-visible px-4 py-16 md:block md:px-8 md:py-20 lg:px-14">
        <div className="mx-auto w-full max-w-[1200px] overflow-visible">
          <WorkScatterGrid />
        </div>
      </div>
    </main>
  );
}
