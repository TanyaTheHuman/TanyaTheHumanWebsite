"use client";

import { useEffect, useRef, useState } from "react";
import { WorkCard } from "@/components/WorkCard";
import { WORK_ITEMS } from "@/lib/work-items";

const CARD_COUNT = WORK_ITEMS.length;
const MAX_PEEK = Math.min(CARD_COUNT - 1, 4);

/**
 * Tall section + sticky viewport: page scroll drives card index (mobile only).
 * Each card gets one viewport-height of scroll while the stage stays pinned.
 */
export function WorkScrollCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const tones = [
    "bg-stone-50",
    "bg-amber-50",
    "bg-emerald-50",
    "bg-sky-50",
    "bg-rose-50",
  ] as const;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let lastIndex = -1;

    const getViewportHeight = () =>
      window.visualViewport?.height ?? window.innerHeight;

    const setIndex = (index: number) => {
      if (index === lastIndex) return;
      lastIndex = index;
      setActiveIndex(index);
      sessionStorage.setItem("workCarouselIndex", String(index));
    };

    const updateIndex = () => {
      const rect = section.getBoundingClientRect();
      // visualViewport matches the visible area when the mobile URL bar shows/hides
      const viewportHeight = getViewportHeight();
      const scrollableDistance = section.offsetHeight - viewportHeight;

      if (scrollableDistance <= 0) {
        setIndex(0);
        return;
      }

      if (rect.top > 0) {
        setIndex(0);
        return;
      }

      if (-rect.top >= scrollableDistance) {
        setIndex(CARD_COUNT - 1);
        return;
      }

      const progress = -rect.top / scrollableDistance;
      const index = Math.min(
        CARD_COUNT - 1,
        Math.max(0, Math.floor(progress * CARD_COUNT)),
      );
      setIndex(index);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateIndex);
    };

    // Restore the last viewed card on refresh (without smooth scrolling).
    const saved = sessionStorage.getItem("workCarouselIndex");
    const savedIndex = saved ? Number.parseInt(saved, 10) : NaN;
    if (!Number.isNaN(savedIndex) && savedIndex > 0) {
      const viewportHeight = getViewportHeight();
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollableDistance = section.offsetHeight - viewportHeight;
      const progress = Math.min(1, Math.max(0, savedIndex / CARD_COUNT));
      const targetY = sectionTop + progress * scrollableDistance;

      const el = document.documentElement;
      const previous = el.style.scrollBehavior;
      el.style.scrollBehavior = "auto";
      window.scrollTo(0, targetY);
      el.style.scrollBehavior = previous;
    }

    updateIndex();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("scroll", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${CARD_COUNT * 100}dvh` }}
      aria-label="Work"
    >
      <div className="sticky top-0 flex h-dvh flex-col">
        <div className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-8 pt-14">
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            {WORK_ITEMS.map((item, index) => {
              // Circular pile model:
              // when nearing the end, early cards loop back into "up next" slots.
              const ahead = (index - activeIndex + CARD_COUNT) % CARD_COUNT;
              const isPrevious = ahead === CARD_COUNT - 1;
              const slot = isPrevious ? -1 : ahead;

              // We render a stack window:
              // - slot === 0 is the top/front card
              // - slot 1..MAX_PEEK are peeking "up next" cards (can wrap around)
              // - slot === -1 is the card we just scrolled past (brief fade out)
              const shouldRender =
                slot === -1 || (slot >= 0 && slot <= MAX_PEEK);
              if (!shouldRender) return null;

              const isActive = slot === 0;

              // Visual stack math (kept in JS so it can be tuned like Figma constraints).
              const clampedBehind = Math.max(0, slot);
              const scatterTilt = item.scatter.rotateDeg * 0.45;

              // Irregular offsets so the stack feels hand-scattered, not machine-neat.
              const xBehindMap = [0, -18, 16, -14, 12];
              // Let some upcoming cards peek above the front card for a rougher pile.
              const yBehindMap = [0, -28, -6, 34, 72];
              const scaleBehindMap = [1, 0.95, 0.92, 0.88, 0.84];

              const y = slot < 0 ? 56 : yBehindMap[clampedBehind] ?? 102;
              const x = slot < 0 ? -8 : xBehindMap[clampedBehind] ?? 0;
              const scale =
                slot < 0 ? 0.97 : scaleBehindMap[clampedBehind] ?? 0.82;
              const opacity = (() => {
                if (slot < 0) return 0;
                if (slot >= 4) return 0.45;
                if (slot === 3) return 0.62;
                if (slot === 2) return 0.78;
                if (slot === 1) return 0.9;
                return 1;
              })();
              const rotateDeg =
                slot < 0
                  ? scatterTilt
                  : clampedBehind === 0
                    ? 0
                    : scatterTilt;

              // Higher zIndex for the top card; behind cards step down.
              const zIndex = slot < 0 ? 9 : 10 - clampedBehind;

              return (
                <div
                  key={item.id}
                  className="absolute inset-x-8 top-1/2 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    // Keep center anchoring, but add irregular offsets and tilt.
                    transform: `translate3d(${x}px, ${y}px, 0) translateY(-50%) rotate(${rotateDeg}deg) scale(${scale})`,
                    opacity,
                    zIndex,
                  }}
                  aria-hidden={!isActive}
                >
                  <div
                    className={[
                      isActive ? "pointer-events-auto" : "pointer-events-none",
                      // Subtle depth cue: the top card is crisply defined; back cards recede.
                      isActive
                        ? "shadow-[0_1px_0_0_rgba(0,0,0,0.10)]"
                        : "shadow-none",
                    ].join(" ")}
                  >
                    <WorkCard
                      title={item.title}
                      toneClassName={tones[index % tones.length]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
