import type { Metadata } from "next";
import { DevBreakpointMarker } from "@/components/DevBreakpointMarker";
import { WorkScatterGrid } from "@/components/WorkScatterGrid";
import { WorkMobileCarousel } from "@/components/WorkMobileCarousel";

export const metadata: Metadata = {
  title: "Work — Tanya, the human",
  description: "Product design work.",
};

export default function WorkPage() {
  return (
    <main className="work-page bg-cream text-ink min-h-screen overflow-x-clip">
      <DevBreakpointMarker />

      {/* Phone: swipe (touch) or scroll (mouse) carousel */}
      <div className="md:hidden">
        <WorkMobileCarousel />
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
