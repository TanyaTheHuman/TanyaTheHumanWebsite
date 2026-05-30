"use client";

import { useEffect, useRef, useState } from "react";
import { WorkCard } from "@/components/WorkCard";
import { WORK_ITEMS, type WorkItem } from "@/lib/work-items";

const CARD_COUNT = WORK_ITEMS.length;
const MAX_PEEK = Math.min(CARD_COUNT - 1, 4);
/** Matches Tailwind px-8 — gutter from screen edge to card lane */
const PILE_SIDE_PAD_PX = 32;
/** Horizontal nudge room inside the lane (scatter identity stays proportional) */
const SCATTER_X_ROOM_PX = 18;
/** Slightly narrower than lane so tilted corners stay inside the gutter */
const CARD_WIDTH_RATIO = 0.94;

const SLIDE_MS = 440;
const SLIDE_OUT_EASE = "cubic-bezier(0.55, 0, 0.75, 0.2)";
const SLIDE_IN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const BACK_GROW_MS = 480;
const BACK_BOUNCE_EASE = "cubic-bezier(0.34, 1.45, 0.64, 1)";
const BACK_SHRINK_EASE = "cubic-bezier(0.5, 0, 0.75, 0.2)";
const STRAIGHTEN_MS = 260;
const STRAIGHTEN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const tones = [
  "bg-stone-50",
  "bg-amber-50",
  "bg-emerald-50",
  "bg-sky-50",
  "bg-rose-50",
] as const;

type CardPose = {
  x: number;
  y: number;
  scale: number;
  rotateDeg: number;
  opacity: number;
  blurPx: number;
};

type CardIdentity = {
  x: number;
  y: number;
  tilt: number;
};

type PileAnimation = {
  cardId: string;
  direction: "forward" | "reverse";
  step: "front" | "left" | "back" | "right";
};

/** Depth: scale + blur; cards stay opaque so they don't show through each other */
const scaleByDepth = [1, 0.95, 0.92, 0.88, 0.84];
const blurByDepth = [0, 1, 1.5, 3, 5];

function blurForDepth(depth: number): number {
  return blurByDepth[Math.min(depth, MAX_PEEK)] ?? 7;
}

function parsePercent(value: string): number {
  return parseFloat(value.replace("%", ""));
}

const MAX_ABS_SCATTER_X = Math.max(
  ...WORK_ITEMS.map(
    (item) => Math.abs((parsePercent(item.scatter.left) - 32) * 2.6),
  ),
);

function getMaxScatterX(): number {
  return SCATTER_X_ROOM_PX;
}

/** Fixed offset + slant per card, derived from Figma scatter */
function getCardIdentity(item: WorkItem): CardIdentity {
  const left = parsePercent(item.scatter.left);
  const top = parsePercent(item.scatter.top);
  const rawX = (left - 32) * 2.6;
  const maxX = getMaxScatterX();

  return {
    x: (rawX / MAX_ABS_SCATTER_X) * maxX,
    y: (top - 38) * 2.0,
    tilt: item.scatter.rotateDeg * 0.45,
  };
}

function getPilePose(item: WorkItem, ahead: number): CardPose {
  const { x, y, tilt } = getCardIdentity(item);
  const depth = Math.min(ahead, MAX_PEEK);
  const isFront = depth === 0;

  return {
    x,
    y,
    scale: scaleByDepth[depth] ?? 0.84,
    rotateDeg: isFront ? 0 : tilt,
    opacity: 1,
    blurPx: blurForDepth(depth),
  };
}

function getOffScreenLeftPose(item: WorkItem): CardPose {
  const { y, tilt } = getCardIdentity(item);
  const x =
    typeof window !== "undefined"
      ? -Math.max(
          (window.innerWidth - PILE_SIDE_PAD_PX * 2) * 0.95,
          280,
        )
      : -320;
  return {
    x,
    y,
    scale: 0.94,
    rotateDeg: tilt * 0.6,
    opacity: 1,
    blurPx: 0,
  };
}

function getOffScreenRightPose(item: WorkItem): CardPose {
  const { y, tilt } = getCardIdentity(item);
  const x =
    typeof window !== "undefined"
      ? Math.max(
          (window.innerWidth - PILE_SIDE_PAD_PX * 2) * 0.95,
          280,
        )
      : 320;
  return {
    x,
    y,
    scale: 0.94,
    rotateDeg: tilt * 0.6,
    opacity: 1,
    blurPx: 0,
  };
}

/** Scatter offset + rotate + scale only — vertical centering is on the outer wrapper */
function poseToTransform(pose: CardPose): string {
  return `translate3d(${pose.x}px, ${pose.y}px, 0) rotate(${pose.rotateDeg}deg) scale(${pose.scale})`;
}

/**
 * Scroll picks the top card. Forward: top card exits left, lands on back.
 * Reverse: back card shrinks, swipes in from the right on top.
 */
export function WorkScrollCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pileTopIndex, setPileTopIndex] = useState(0);
  const [animation, setAnimation] = useState<PileAnimation | null>(null);
  const [displacedTopIndex, setDisplacedTopIndex] = useState<number | null>(
    null,
  );
  const activeIndexRef = useRef(0);
  const pileTopIndexRef = useRef(0);
  const animCleanupRef = useRef<(() => void) | null>(null);

  const clearAnimation = () => {
    setAnimation(null);
    setDisplacedTopIndex(null);
  };

  const startForwardAnimation = (
    cardId: string,
    onSlideComplete: () => void,
  ) => {
    animCleanupRef.current?.();
    setDisplacedTopIndex(null);
    setAnimation({ cardId, direction: "forward", step: "front" });

    const timeouts: number[] = [];
    const rafs: number[] = [];

    rafs.push(
      requestAnimationFrame(() => {
        rafs.push(
          requestAnimationFrame(() => {
            setAnimation({ cardId, direction: "forward", step: "left" });
          }),
        );
      }),
    );

    timeouts.push(
      window.setTimeout(() => {
        onSlideComplete();
        setAnimation({ cardId, direction: "forward", step: "back" });
      }, SLIDE_MS),
    );

    timeouts.push(
      window.setTimeout(() => {
        clearAnimation();
      }, SLIDE_MS + BACK_GROW_MS),
    );

    animCleanupRef.current = () => {
      timeouts.forEach((id) => window.clearTimeout(id));
      rafs.forEach((id) => cancelAnimationFrame(id));
    };
  };

  const startReverseAnimation = (
    cardId: string,
    onShrinkComplete: () => void,
  ) => {
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
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;

    const getViewportHeight = () =>
      window.visualViewport?.height ?? window.innerHeight;

    const setIndex = (index: number) => {
      const prev = activeIndexRef.current;
      if (index === prev) return;

      const forward = index > prev;

      activeIndexRef.current = index;
      setActiveIndex(index);
      sessionStorage.setItem("workCarouselIndex", String(index));

      if (forward) {
        // Keep pile order on the old top until the outgoing card has slid away
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
      activeIndexRef.current = savedIndex;
      pileTopIndexRef.current = savedIndex;
      setActiveIndex(savedIndex);
      setPileTopIndex(savedIndex);
    }

    updateIndex();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("scroll", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      animCleanupRef.current?.();
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
        <div className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col pt-14">
          <div
            className={`relative flex min-h-0 flex-1 items-center justify-center ${
              animation ? "overflow-x-visible" : "overflow-x-clip"
            }`}
          >
            {WORK_ITEMS.map((item, index) => (
              <PileCard
                key={item.id}
                item={item}
                itemIndex={index}
                activeIndex={activeIndex}
                pileTopIndex={pileTopIndex}
                animation={animation}
                displacedTopIndex={displacedTopIndex}
                toneClassName={tones[index % tones.length]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PileCard({
  item,
  itemIndex,
  activeIndex,
  pileTopIndex,
  animation,
  displacedTopIndex,
  toneClassName,
}: {
  item: WorkItem;
  itemIndex: number;
  activeIndex: number;
  pileTopIndex: number;
  animation: PileAnimation | null;
  displacedTopIndex: number | null;
  toneClassName: string;
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
  const [backGrown, setBackGrown] = useState(false);
  const [backShrunk, setBackShrunk] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    if (!isForwardExit || animation?.step !== "back") {
      setBackGrown(false);
      return;
    }
    const id = requestAnimationFrame(() => setBackGrown(true));
    return () => cancelAnimationFrame(id);
  }, [isForwardExit, animation?.step, animation?.cardId]);

  useEffect(() => {
    if (!isReverseEnter || animation?.step !== "back") {
      setBackShrunk(false);
      return;
    }
    const id = requestAnimationFrame(() => setBackShrunk(true));
    return () => cancelAnimationFrame(id);
  }, [isReverseEnter, animation?.step, animation?.cardId]);

  useEffect(() => {
    if (!isReverseEnter || animation?.step !== "right") {
      setSlideIn(false);
      return;
    }
    const id = requestAnimationFrame(() => setSlideIn(true));
    return () => cancelAnimationFrame(id);
  }, [isReverseEnter, animation?.step, animation?.cardId]);

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

  // Next card: keep depth scale + tilt; only straighten (and grow to full) after slide-out
  if (
    itemIndex === activeIndex &&
    animation?.direction === "forward" &&
    animation.step === "back" &&
    !isForwardExit
  ) {
    pose = getPilePose(item, 0);
    transition = motionTransition;
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
      zIndex = 50;
    } else if (animation.step === "left") {
      pose = getOffScreenLeftPose(item);
      zIndex = 50;
      transition = `transform ${SLIDE_MS}ms ${SLIDE_OUT_EASE}`;
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
    !(
      itemIndex === activeIndex &&
      animation?.direction === "forward" &&
      animation.step === "back"
    )
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
