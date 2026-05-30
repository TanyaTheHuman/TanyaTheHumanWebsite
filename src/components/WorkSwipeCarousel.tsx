"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WorkPileStage } from "@/components/WorkPileStage";
import { useWorkPileAnimation } from "@/hooks/useWorkPileAnimation";
import {
  CARD_COUNT,
  STRAIGHTEN_EASE,
  STRAIGHTEN_MS,
  WORK_CAROUSEL_INDEX_KEY,
  blocksSwipeInteraction,
  getExitSlideMs,
  getExitVector,
  type ExitVector,
} from "@/lib/work-pile-math";
import { WORK_ITEMS } from "@/lib/work-items";

const DRAG_THRESHOLD_PX = 56;
const VELOCITY_THRESHOLD = 0.35;
const SNAP_BACK_TRANSITION = `transform ${STRAIGHTEN_MS}ms ${STRAIGHTEN_EASE}, filter ${STRAIGHTEN_MS}ms ease`;

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  lastX: number;
  lastY: number;
  lastTime: number;
};

/**
 * Touch pile: drag in any direction to advance. Always forward, wraps at end.
 */
export function WorkSwipeCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pileTopIndex, setPileTopIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [dragTransition, setDragTransition] = useState<string | undefined>(
    undefined,
  );

  const activeIndexRef = useRef(0);
  const pileTopIndexRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);
  const isAnimatingRef = useRef(false);

  const {
    animation,
    displacedTopIndex,
    startForwardAnimation,
  } = useWorkPileAnimation();

  useEffect(() => {
    isAnimatingRef.current = blocksSwipeInteraction(animation);
  }, [animation]);

  const persistIndex = useCallback((index: number) => {
    sessionStorage.setItem(WORK_CAROUSEL_INDEX_KEY, String(index));
  }, []);

  const advanceForward = useCallback(
    (
      exitVector: ExitVector,
      exitStartOffset: ExitVector,
      exitSlideMs: number,
    ) => {
      if (isAnimatingRef.current) return;

      const prev = activeIndexRef.current;
      const next = (prev + 1) % CARD_COUNT;

      activeIndexRef.current = next;
      setActiveIndex(next);
      persistIndex(next);

      pileTopIndexRef.current = prev;
      setPileTopIndex(prev);

      startForwardAnimation(
        WORK_ITEMS[prev].id,
        () => {
          pileTopIndexRef.current = next;
          setPileTopIndex(next);
        },
        { exitVector, exitStartOffset, exitSlideMs },
      );
    },
    [persistIndex, startForwardAnimation],
  );

  useEffect(() => {
    const saved = sessionStorage.getItem(WORK_CAROUSEL_INDEX_KEY);
    const savedIndex = saved ? Number.parseInt(saved, 10) : NaN;
    if (!Number.isNaN(savedIndex) && savedIndex >= 0 && savedIndex < CARD_COUNT) {
      activeIndexRef.current = savedIndex;
      pileTopIndexRef.current = savedIndex;
      requestAnimationFrame(() => {
        setActiveIndex(savedIndex);
        setPileTopIndex(savedIndex);
      });
    }
  }, []);

  const resetDrag = useCallback((snapBack = false) => {
    dragRef.current = null;
    if (snapBack) {
      setDragTransition(SNAP_BACK_TRANSITION);
      setDragOffset({ x: 0, y: 0 });
      window.setTimeout(() => {
        setDragOffset(null);
        setDragTransition(undefined);
      }, STRAIGHTEN_MS);
    } else {
      setDragTransition(undefined);
      setDragOffset(null);
    }
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isAnimatingRef.current || dragRef.current) return;
    if (event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const now = performance.now();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: now,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: now,
    };
    setDragTransition(undefined);
    setDragOffset({ x: 0, y: 0 });
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    setDragTransition(undefined);
    setDragOffset({ x: dx, y: dy });

    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = performance.now();
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.currentTarget.releasePointerCapture(event.pointerId);

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const distance = Math.hypot(dx, dy);
    const gestureDuration = performance.now() - drag.startTime;
    const dt = Math.max(performance.now() - drag.lastTime, 1);
    const vx = (event.clientX - drag.lastX) / dt;
    const vy = (event.clientY - drag.lastY) / dt;
    const releaseVelocity = Math.hypot(vx, vy);

    dragRef.current = null;

    if (distance >= DRAG_THRESHOLD_PX || releaseVelocity >= VELOCITY_THRESHOLD) {
      const useVelocity =
        releaseVelocity >= VELOCITY_THRESHOLD && distance < DRAG_THRESHOLD_PX;
      const vectorDx = useVelocity ? vx : dx;
      const vectorDy = useVelocity ? vy : dy;
      const exitStartOffset = { x: dx, y: dy };
      const exitSlideMs = getExitSlideMs(
        releaseVelocity,
        gestureDuration,
        distance,
      );

      setDragOffset(null);
      setDragTransition(undefined);
      advanceForward(
        getExitVector(vectorDx, vectorDy),
        exitStartOffset,
        exitSlideMs,
      );
    } else {
      resetDrag(true);
    }
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    resetDrag(true);
  };

  return (
    <section className="relative h-dvh" aria-label="Work">
      <div className="sticky top-0 flex h-dvh flex-col">
        <div className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col pt-14">
          <WorkPileStage
            activeIndex={activeIndex}
            pileTopIndex={pileTopIndex}
            animation={animation}
            displacedTopIndex={displacedTopIndex}
            dragOffset={dragOffset}
            dragTransition={dragTransition}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          />
        </div>
      </div>
    </section>
  );
}
