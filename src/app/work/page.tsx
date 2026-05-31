import type { Metadata } from "next";
import { DevBreakpointMarker } from "@/components/DevBreakpointMarker";
import { WorkPageHeader } from "@/components/WorkPageHeader";
import { WorkScatterGrid } from "@/components/WorkScatterGrid";
import { WorkMobileCarousel } from "@/components/WorkMobileCarousel";

export const metadata: Metadata = {
  title: "Work — Tanya, the human",
  description: "Product design work.",
};

export default function WorkPage() {
  return (
    <main className="work-page bg-cream text-ink flex min-h-0 flex-col overflow-x-clip md:min-h-screen">
      <DevBreakpointMarker />

      <div
        data-work-header
        className="mx-auto w-full max-w-[1200px] shrink-0 px-4 max-md:pt-[max(3.5rem,calc(env(safe-area-inset-top,0px)+1rem))] md:px-14 md:pt-14"
      >
        <WorkPageHeader />
      </div>

      {/* Fixed 48px gutter between header block and work content */}
      <div className="h-12 shrink-0" aria-hidden="true" />

      {/* Phone: swipe (touch) or scroll (mouse) carousel */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <WorkMobileCarousel />
      </div>

      {/* Tablet + desktop: scattered pile */}
      <div className="hidden overflow-visible px-4 pb-16 md:block md:px-8 md:pb-20 lg:px-14">
        <div className="mx-auto w-full max-w-[1200px] overflow-visible">
          <WorkScatterGrid />
        </div>
      </div>
    </main>
  );
}
