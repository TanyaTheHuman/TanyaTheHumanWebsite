"use client";

import { useEffect, useRef, useState } from "react";
import { WorkPileStage } from "@/components/WorkPileStage";
import { useWorkPileAnimation } from "@/hooks/useWorkPileAnimation";
import { useWorkPileEnter } from "@/hooks/useWorkPileEnter";
import {
  CARD_COUNT,
  WORK_CAROUSEL_INDEX_KEY,
} from "@/lib/work-pile-math";
import { WORK_ITEMS } from "@/lib/work-items";

/**
 * Scroll picks the top card. Forward: top card exits left, lands on back.
 * Reverse: back card shrinks, swipes in from the right on top.
 */
export function WorkScrollCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pileTopIndex, setPileTopIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const pileTopIndexRef = useRef(0);

  const {
    animation,
    displacedTopIndex,
    setDisplacedTopIndex,
    startForwardAnimation,
    startReverseAnimation,
  } = useWorkPileAnimation();

  const { enterStep, isEntering } = useWorkPileEnter();
  const isEnteringRef = useRef(true);

  useEffect(() => {
    isEnteringRef.current = isEntering;
  }, [isEntering]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;

    const getViewportHeight = () =>
      window.visualViewport?.height ?? window.innerHeight;

    const setIndex = (index: number) => {
      if (isEnteringRef.current) return;

      const prev = activeIndexRef.current;
      if (index === prev) return;

      const forward = index > prev;

      activeIndexRef.current = index;
      setActiveIndex(index);
      sessionStorage.setItem(WORK_CAROUSEL_INDEX_KEY, String(index));

      if (forward) {
        pileTopIndexRef.current = prev;
        setPileTopIndex(prev);
        setDisplacedTopIndex(null);
        startForwardAnimation(WORK_ITEMS[prev].id, () => {
          pileTopIndexRef.current = index;
          setPileTopIndex(index);
        });
      } else {
        pileTopIndexRef.current = prev;
        setPileTopIndex(prev);
        setDisplacedTopIndex(prev);
        startReverseAnimation(WORK_ITEMS[index].id, () => {
          pileTopIndexRef.current = index;
          setPileTopIndex(index);
        });
      }
    };

    const updateIndex = () => {
      const rect = section.getBoundingClientRect();
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

    const saved = sessionStorage.getItem(WORK_CAROUSEL_INDEX_KEY);
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
      activeIndexRef.current = savedIndex;
      pileTopIndexRef.current = savedIndex;
      requestAnimationFrame(() => {
        setActiveIndex(savedIndex);
        setPileTopIndex(savedIndex);
      });
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
  }, [setDisplacedTopIndex, startForwardAnimation, startReverseAnimation]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${CARD_COUNT * 100}dvh` }}
      aria-label="Work"
    >
      <div className="sticky top-0 flex h-dvh flex-col">
        <div className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col pt-14">
          <WorkPileStage
            activeIndex={activeIndex}
            pileTopIndex={pileTopIndex}
            animation={animation}
            displacedTopIndex={displacedTopIndex}
            enterStep={enterStep}
          />
        </div>
      </div>
    </section>
  );
}
