/**
 * Dev-only: shows Phone / Tablet / Desktop while resizing.
 * Uses Tailwind defaults: sm 640px, md 768px, lg 1024px.
 */
export function DevBreakpointMarker() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      data-dev-breakpoint-marker
      className="caption fixed top-0 right-0 left-0 z-[200] border-b border-stone-400 px-3 py-1.5 text-center font-mono text-[11px] tracking-wide text-stone-600"
      aria-hidden
    >
      <span className="md:hidden">Phone · &lt;768px</span>
      <span className="hidden md:inline lg:hidden">Tablet · 768px–1023px</span>
      <span className="hidden lg:inline">Desktop · ≥1024px</span>
    </div>
  );
}
