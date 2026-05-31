"use client";

import { useEffect, useState } from "react";
import {
  CARD_COUNT,
  ENTER_BACK_GROW_MS,
  ENTER_SLIDE_MS,
  getPileEnterDurationMs,
} from "@/lib/work-pile-math";

/** 0 = pending; 1…CARD_COUNT = that pile depth is animating; CARD_COUNT+1 = done */
export type PileEnterStep = number;

export type WorkEnterPhase = "pending" | "active" | "done";

/** Sequential pile load: front slides in, then each back card grows in order. */
export function useWorkPileEnter() {
  const [enterStep, setEnterStep] = useState<PileEnterStep>(0);

  useEffect(() => {
    const timeouts: number[] = [];
    const raf = requestAnimationFrame(() => setEnterStep(1));

    let delay = ENTER_SLIDE_MS;
    for (let back = 1; back < CARD_COUNT; back++) {
      timeouts.push(window.setTimeout(() => setEnterStep(back + 1), delay));
      delay += ENTER_BACK_GROW_MS;
    }

    // Mark enter complete after the last back card finishes growing
    timeouts.push(
      window.setTimeout(() => setEnterStep(CARD_COUNT + 1), delay),
    );

    return () => {
      cancelAnimationFrame(raf);
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return {
    enterStep,
    isEntering: enterStep <= CARD_COUNT,
    enterDurationMs: getPileEnterDurationMs(),
  };
}

/** Parallel fade/slide for scatter grid (single duration). */
export function useWorkEnterPhase(durationMs: number) {
  const [enterPhase, setEnterPhase] = useState<WorkEnterPhase>("pending");

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEnterPhase("active"));
    const timeout = window.setTimeout(() => setEnterPhase("done"), durationMs);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [durationMs]);

  return {
    enterPhase,
    isEntering: enterPhase !== "done",
  };
}
