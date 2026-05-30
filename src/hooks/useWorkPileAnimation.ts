"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BACK_GROW_MS,
  SLIDE_MS,
  STRAIGHTEN_MS,
  type ExitVector,
  type PileAnimation,
} from "@/lib/work-pile-math";

export function useWorkPileAnimation() {
  const [animation, setAnimation] = useState<PileAnimation | null>(null);
  const [displacedTopIndex, setDisplacedTopIndex] = useState<number | null>(
    null,
  );
  const animCleanupRef = useRef<(() => void) | null>(null);

  const clearAnimation = useCallback(() => {
    setAnimation(null);
    setDisplacedTopIndex(null);
  }, []);

  const startForwardAnimation = useCallback(
    (
      cardId: string,
      onSlideComplete: () => void,
      options?: {
        exitVector?: ExitVector;
        exitStartOffset?: ExitVector;
        exitSlideMs?: number;
      },
    ) => {
      animCleanupRef.current?.();
      setDisplacedTopIndex(null);
      const exitVector = options?.exitVector;
      const exitStartOffset = options?.exitStartOffset;
      const slideMs = options?.exitSlideMs ?? SLIDE_MS;
      const isSwipeExit = exitStartOffset != null;

      const animBase = {
        exitVector,
        exitSlideMs: slideMs,
        ...(isSwipeExit ? { isSwipeExit: true as const } : {}),
      };

      const scheduleSlideComplete = () => {
        timeouts.push(
          window.setTimeout(() => {
            onSlideComplete();
            setAnimation({
              cardId,
              direction: "forward",
              step: "back",
              ...animBase,
            });
          }, slideMs),
        );

        timeouts.push(
          window.setTimeout(() => {
            clearAnimation();
          }, slideMs + BACK_GROW_MS),
        );
      };

      const timeouts: number[] = [];
      const rafs: number[] = [];

      if (isSwipeExit) {
        // Swipe: launch exit immediately; WorkPileCard paints start pose then flies off in one frame
        setAnimation({
          cardId,
          direction: "forward",
          step: "left",
          exitStartOffset,
          ...animBase,
        });

        rafs.push(
          requestAnimationFrame(() => {
            scheduleSlideComplete();
          }),
        );
      } else {
        // Scroll: commit front pose, then exit on the next frame
        setAnimation({
          cardId,
          direction: "forward",
          step: "front",
          ...animBase,
        });

        rafs.push(
          requestAnimationFrame(() => {
            setAnimation({
              cardId,
              direction: "forward",
              step: "left",
              ...animBase,
            });
            scheduleSlideComplete();
          }),
        );
      }

      animCleanupRef.current = () => {
        timeouts.forEach((id) => window.clearTimeout(id));
        rafs.forEach((id) => cancelAnimationFrame(id));
      };
    },
    [clearAnimation],
  );

  const startReverseAnimation = useCallback(
    (cardId: string, onShrinkComplete: () => void) => {
      animCleanupRef.current?.();
      setAnimation({ cardId, direction: "reverse", step: "back" });

      const timeouts: number[] = [];

      timeouts.push(
        window.setTimeout(() => {
          onShrinkComplete();
          setAnimation({ cardId, direction: "reverse", step: "right" });
        }, BACK_GROW_MS),
      );

      timeouts.push(
        window.setTimeout(() => {
          setAnimation({ cardId, direction: "reverse", step: "front" });
        }, BACK_GROW_MS + SLIDE_MS),
      );

      timeouts.push(
        window.setTimeout(() => {
          clearAnimation();
        }, BACK_GROW_MS + SLIDE_MS + STRAIGHTEN_MS),
      );

      animCleanupRef.current = () => {
        timeouts.forEach((id) => window.clearTimeout(id));
      };
    },
    [clearAnimation],
  );

  useEffect(() => {
    return () => {
      animCleanupRef.current?.();
    };
  }, []);

  return {
    animation,
    displacedTopIndex,
    setDisplacedTopIndex,
    startForwardAnimation,
    startReverseAnimation,
    isAnimating: animation !== null,
  };
}
