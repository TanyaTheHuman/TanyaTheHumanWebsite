"use client";

import { useEffect, useState } from "react";
import { WorkCard } from "@/components/WorkCard";
import {
  BACK_BOUNCE_EASE,
  BACK_GROW_MS,
  BACK_SHRINK_EASE,
  CARD_COUNT,
  CARD_WIDTH_RATIO,
  MAX_PEEK,
  PILE_SIDE_PAD_PX,
  SLIDE_IN_EASE,
  SLIDE_MS,
  SLIDE_OUT_EASE,
  STRAIGHTEN_EASE,
  STRAIGHTEN_MS,
  SWIPE_EXIT_EASE,
  blurForDepth,
  getCardIdentity,
  getOffScreenPose,
  getOffScreenRightPose,
  getPilePose,
  poseToTransform,
  scaleByDepth,
  type PileAnimation,
} from "@/lib/work-pile-math";
import type { WorkItem } from "@/lib/work-items";

export type DragOffset = { x: number; y: number } | null;

export function WorkPileCard({
  item,
  itemIndex,
  activeIndex,
  pileTopIndex,
  animation,
  displacedTopIndex,
  toneClassName,
  dragOffset = null,
  dragTransition,
}: {
  item: WorkItem;
  itemIndex: number;
  activeIndex: number;
  pileTopIndex: number;
  animation: PileAnimation | null;
  displacedTopIndex: number | null;
  toneClassName: string;
  dragOffset?: DragOffset;
  dragTransition?: string;
}) {
  const identity = getCardIdentity(item);
  const isForwardExit =
    animation?.direction === "forward" && animation.cardId === item.id;
  const isReverseEnter =
    animation?.direction === "reverse" && animation.cardId === item.id;
  const isFeatured =
    animation?.direction === "reverse" && animation.step === "back"
      ? itemIndex === pileTopIndex
      : itemIndex === activeIndex;
  const isDraggingTop =
    dragOffset !== null && itemIndex === activeIndex && animation === null;
  const [backGrown, setBackGrown] = useState(false);
  const [backShrunk, setBackShrunk] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [exitLaunched, setExitLaunched] = useState(false);

  useEffect(() => {
    if (!isForwardExit || animation?.step !== "back") {
      const id = requestAnimationFrame(() => setBackGrown(false));
      return () => cancelAnimationFrame(id);
    }
    const id = requestAnimationFrame(() => setBackGrown(true));
    return () => cancelAnimationFrame(id);
  }, [isForwardExit, animation?.step, animation?.cardId]);

  useEffect(() => {
    if (!isReverseEnter || animation?.step !== "back") {
      const id = requestAnimationFrame(() => setBackShrunk(false));
      return () => cancelAnimationFrame(id);
    }
    const id = requestAnimationFrame(() => setBackShrunk(true));
    return () => cancelAnimationFrame(id);
  }, [isReverseEnter, animation?.step, animation?.cardId]);

  useEffect(() => {
    if (!isReverseEnter || animation?.step !== "right") {
      const id = requestAnimationFrame(() => setSlideIn(false));
      return () => cancelAnimationFrame(id);
    }
    const id = requestAnimationFrame(() => setSlideIn(true));
    return () => cancelAnimationFrame(id);
  }, [isReverseEnter, animation?.step, animation?.cardId]);

  useEffect(() => {
    if (!isForwardExit || animation?.step !== "left" || !animation.exitStartOffset) {
      const id = requestAnimationFrame(() => setExitLaunched(false));
      return () => cancelAnimationFrame(id);
    }
    const id = requestAnimationFrame(() => setExitLaunched(true));
    return () => cancelAnimationFrame(id);
  }, [
    isForwardExit,
    animation?.step,
    animation?.cardId,
    animation?.exitStartOffset,
  ]);

  const ahead = (itemIndex - pileTopIndex + CARD_COUNT) % CARD_COUNT;
  const depth = Math.min(ahead, MAX_PEEK);
  const isDisplacedTop =
    displacedTopIndex === itemIndex &&
    animation?.direction === "reverse" &&
    (animation.step === "right" || animation.step === "front");

  let pose = getPilePose(item, ahead);
  let zIndex = Math.max(1, 10 - depth);
  let transition = "none";
  const motionTransition = `transform ${STRAIGHTEN_MS}ms ${STRAIGHTEN_EASE}, filter ${STRAIGHTEN_MS}ms ease`;
  const isSwipeForward = animation?.isSwipeExit === true;
  const isNextCardStraightening =
    itemIndex === activeIndex &&
    animation?.direction === "forward" &&
    !isForwardExit &&
    (animation.step === "back" ||
      (isSwipeForward && animation.step === "left"));

  // Swipe: next card straightens on release while the outgoing card exits
  if (isNextCardStraightening) {
    const straightenMs =
      isSwipeForward && animation.exitSlideMs
        ? animation.exitSlideMs
        : STRAIGHTEN_MS;
    pose = getPilePose(item, 0);
    transition = `transform ${straightenMs}ms ${STRAIGHTEN_EASE}, filter ${straightenMs}ms ease`;
  } else if (isDisplacedTop && animation) {
    const { x, y, tilt } = identity;
    const behindScale = scaleByDepth[1];
    const behindBlur = blurForDepth(1);
    if (animation.step === "right") {
      pose = {
        x,
        y,
        scale: behindScale,
        rotateDeg: 0,
        opacity: 1,
        blurPx: behindBlur,
      };
      transition = "none";
    } else {
      pose = {
        x,
        y,
        scale: behindScale,
        rotateDeg: tilt,
        opacity: 1,
        blurPx: behindBlur,
      };
      transition = motionTransition;
    }
  }

  if (isForwardExit && animation) {
    if (animation.step === "front") {
      pose = getPilePose(item, 0);
      if (animation.exitStartOffset) {
        pose = {
          ...pose,
          x: pose.x + animation.exitStartOffset.x,
          y: pose.y + animation.exitStartOffset.y,
        };
      }
      zIndex = 50;
    } else if (animation.step === "left") {
      const slideMs = animation.exitSlideMs ?? SLIDE_MS;
      const exitEase = animation.exitStartOffset
        ? SWIPE_EXIT_EASE
        : SLIDE_OUT_EASE;
      const holdAtRelease =
        animation.exitStartOffset != null && !exitLaunched;

      if (holdAtRelease && animation.exitStartOffset) {
        const { x: ox, y: oy } = animation.exitStartOffset;
        pose = getPilePose(item, 0);
        pose = {
          ...pose,
          x: pose.x + ox,
          y: pose.y + oy,
        };
        zIndex = 50;
        transition = "none";
      } else {
        pose = getOffScreenPose(
          item,
          animation.exitVector ?? { x: -1, y: 0 },
        );
        zIndex = 50;
        transition = `transform ${slideMs}ms ${exitEase}`;
      }
    } else {
      const backScale = scaleByDepth[4];
      const growFrom = backScale * 0.52;
      pose = {
        x: identity.x,
        y: identity.y,
        scale: backGrown ? backScale : growFrom,
        rotateDeg: identity.tilt,
        opacity: backGrown ? 1 : 0.15,
        blurPx: blurForDepth(4),
      };
      zIndex = 5;
      transition = backGrown
        ? `transform ${BACK_GROW_MS}ms ${BACK_BOUNCE_EASE}, filter ${BACK_GROW_MS}ms ease, opacity ${BACK_GROW_MS * 0.55}ms ease-out`
        : "none";
    }
  }

  if (
    transition === "none" &&
    !isForwardExit &&
    !isReverseEnter &&
    !isDisplacedTop &&
    !isDraggingTop &&
    !isNextCardStraightening
  ) {
    transition = motionTransition;
  }

  if (isReverseEnter && animation) {
    if (animation.step === "back") {
      const backScale = scaleByDepth[depth];
      const shrinkTo = backScale * 0.52;
      zIndex = Math.max(1, 10 - depth);
      pose = {
        x: identity.x,
        y: identity.y,
        scale: backShrunk ? shrinkTo : backScale,
        rotateDeg: identity.tilt,
        opacity: backShrunk ? 0.12 : 1,
        blurPx: blurForDepth(depth),
      };
      transition = backShrunk
        ? `transform ${BACK_GROW_MS}ms ${BACK_SHRINK_EASE}, filter ${BACK_GROW_MS}ms ease, opacity ${BACK_GROW_MS * 0.55}ms ease-in`
        : "none";
    } else if (animation.step === "right") {
      zIndex = 50;
      const frontTilted = {
        ...getPilePose(item, 0),
        rotateDeg: identity.tilt,
      };
      pose = slideIn ? frontTilted : getOffScreenRightPose(item);
      transition = slideIn
        ? `transform ${SLIDE_MS}ms ${SLIDE_IN_EASE}, filter ${SLIDE_MS}ms ease`
        : "none";
    } else {
      zIndex = 50;
      pose = getPilePose(item, 0);
      transition = motionTransition;
    }
  }

  if (isDraggingTop && dragOffset) {
    pose = {
      ...pose,
      x: pose.x + dragOffset.x,
      y: pose.y + dragOffset.y,
    };
    zIndex = 50;
    transition = dragTransition ?? "none";
  }

  const filterStyle =
    pose.blurPx > 0 ? `blur(${pose.blurPx}px)` : undefined;

  return (
    <div
      className="absolute top-1/2 will-change-transform"
      style={{
        left: PILE_SIDE_PAD_PX,
        right: PILE_SIDE_PAD_PX,
        transform: "translateY(-50%)",
        zIndex,
      }}
      aria-hidden={!isFeatured && !isForwardExit && !isReverseEnter}
    >
      <div
        className={[
          "mx-auto origin-center will-change-transform",
          isFeatured ? "pointer-events-auto" : "pointer-events-none",
          isFeatured ? "shadow-[0_1px_0_0_rgba(0,0,0,0.10)]" : "shadow-none",
        ].join(" ")}
        style={{
          width: `${CARD_WIDTH_RATIO * 100}%`,
          transform: poseToTransform(pose),
          opacity: pose.opacity,
          filter: filterStyle,
          transition,
        }}
      >
        <WorkCard title={item.title} toneClassName={toneClassName} />
      </div>
    </div>
  );
}
