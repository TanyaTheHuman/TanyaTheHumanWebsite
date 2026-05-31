import { WORK_ITEMS, type WorkItem } from "@/lib/work-items";

export const CARD_COUNT = WORK_ITEMS.length;
export const MAX_PEEK = Math.min(CARD_COUNT - 1, 4);

/** Matches Tailwind px-8 — gutter from screen edge to card lane */
export const PILE_SIDE_PAD_PX = 32;
/** Horizontal nudge room inside the lane (scatter identity stays proportional) */
export const SCATTER_X_ROOM_PX = 18;
/** Slightly narrower than lane so tilted corners stay inside the gutter */
export const CARD_WIDTH_RATIO = 0.94;

export const SLIDE_MS = 440;
export const SLIDE_OUT_EASE = "cubic-bezier(0.55, 0, 0.75, 0.2)";
/** Touch exit — fast start so motion continues from the finger without a stall */
export const SWIPE_EXIT_EASE = "cubic-bezier(0.25, 0.85, 0.2, 1)";
export const SLIDE_IN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Load enter — slower front slide; back cards grow in sequence */
export const ENTER_SLIDE_MS = 680;
export const ENTER_BACK_GROW_MS = 400;
/** Subtle overshoot at settle — shared by pile + scatter load */
export const ENTER_BOUNCE_EASE = "cubic-bezier(0.34, 1.28, 0.64, 1)";
export const ENTER_SLIDE_EASE = ENTER_BOUNCE_EASE;
export const ENTER_GROW_EASE = ENTER_BOUNCE_EASE;
export const BACK_GROW_MS = 480;
export const BACK_BOUNCE_EASE = "cubic-bezier(0.34, 1.45, 0.64, 1)";
export const BACK_SHRINK_EASE = "cubic-bezier(0.5, 0, 0.75, 0.2)";
export const STRAIGHTEN_MS = 260;
export const STRAIGHTEN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export const WORK_PILE_TONES = [
  "bg-stone-50",
  "bg-amber-50",
  "bg-emerald-50",
  "bg-sky-50",
  "bg-rose-50",
] as const;

export type CardPose = {
  x: number;
  y: number;
  scale: number;
  rotateDeg: number;
  opacity: number;
  blurPx: number;
};

export type CardIdentity = {
  x: number;
  y: number;
  tilt: number;
};

export type ExitVector = { x: number; y: number };

export type PileAnimation = {
  cardId: string;
  direction: "forward" | "reverse";
  step: "front" | "left" | "back" | "right";
  /** Normalized swipe direction for touch exit; defaults to left for scroll. */
  exitVector?: ExitVector;
  /** Drag offset at release so exit animation continues from the finger position. */
  exitStartOffset?: ExitVector;
  /** Touch exit duration in ms; scroll carousel uses default SLIDE_MS. */
  exitSlideMs?: number;
  /** Touch swipe exit — used to unblock interaction during back-of-pile grow. */
  isSwipeExit?: boolean;
};

/** Swipe pile: only block input while the outgoing card is still exiting. */
export function blocksSwipeInteraction(animation: PileAnimation | null): boolean {
  if (!animation) return false;
  if (animation.isSwipeExit) {
    return animation.direction === "forward" && animation.step === "left";
  }
  return true;
}

/** Depth: scale + blur; cards stay opaque so they don't show through each other */
export const scaleByDepth = [1, 0.95, 0.92, 0.88, 0.84];
export const blurByDepth = [0, 1, 1.5, 3, 5];

export function blurForDepth(depth: number): number {
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
export function getCardIdentity(item: WorkItem): CardIdentity {
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

/** Front card anchor sits at y=0; back cards keep scatter y (can peek above front). */
function pileAnchorY(rawY: number, depth: number): number {
  return depth === 0 ? 0 : rawY;
}

/** px from header block to front card top on /work mobile */
export const PILE_HEADER_TO_FRONT_PX = 48;

/** Room above the card lane so back-card scatter stays inside WorkPileStage. */
export function getPileScatterTopInset(): number {
  const minBackY = Math.min(
    ...WORK_ITEMS.map((item) => getCardIdentity(item).y),
  );
  const tiltBleedPx = 14;
  return Math.ceil(Math.max(0, -minBackY) + tiltBleedPx);
}

export function getPilePose(item: WorkItem, ahead: number): CardPose {
  const { x, y, tilt } = getCardIdentity(item);
  const depth = Math.min(ahead, MAX_PEEK);
  const isFront = depth === 0;

  return {
    x,
    y: pileAnchorY(y, depth),
    scale: scaleByDepth[depth] ?? 0.84,
    rotateDeg: isFront ? 0 : tilt,
    opacity: 1,
    blurPx: blurForDepth(depth),
  };
}

/** Resting pile pose at depth — used when a card grows into the stack. */
export function getBackGrowEndPose(item: WorkItem, depth: number): CardPose {
  return getPilePose(item, depth);
}

/** Tiny faded pose before a card grows into its pile depth. */
export function getBackGrowStartPose(item: WorkItem, depth: number): CardPose {
  const { x, y, tilt } = getCardIdentity(item);
  const d = Math.min(depth, MAX_PEEK);
  const backScale = scaleByDepth[d] ?? 0.84;

  return {
    x,
    y: pileAnchorY(y, d),
    scale: backScale * 0.52,
    rotateDeg: tilt,
    opacity: 0.15,
    blurPx: blurForDepth(d),
  };
}

export type ViewportSize = { width: number; height: number };

export function getOffScreenLeftPose(
  item: WorkItem,
  viewport?: ViewportSize,
): CardPose {
  return getOffScreenPose(item, { x: -1, y: 0 }, viewport);
}

export function getOffScreenRightPose(
  item: WorkItem,
  viewport?: ViewportSize,
): CardPose {
  return getOffScreenPose(item, { x: 1, y: 0 }, viewport);
}

export function getOffScreenPose(
  item: WorkItem,
  vector: ExitVector,
  viewport?: ViewportSize,
): CardPose {
  const { x: baseX, y: baseY, tilt } = getCardIdentity(item);
  const width = viewport?.width ?? 390;
  const height = viewport?.height ?? 844;
  const horizontalReach = Math.max((width - PILE_SIDE_PAD_PX * 2) * 0.95, 280);
  const verticalReach = Math.max(height * 0.55, 360);
  const magnitude = Math.max(horizontalReach, verticalReach);

  return {
    x: baseX + vector.x * magnitude,
    y: baseY + vector.y * magnitude,
    scale: 0.94,
    rotateDeg: tilt * 0.6 * (Math.abs(vector.x) >= Math.abs(vector.y) ? Math.sign(vector.x || -1) : 1),
    opacity: 1,
    blurPx: 0,
  };
}

/** Unit vector from swipe delta or flick velocity. */
export function getExitVector(dx: number, dy: number): ExitVector {
  const length = Math.hypot(dx, dy);
  if (length < 1) return { x: -1, y: 0 };
  return { x: dx / length, y: dy / length };
}

const EXIT_SLIDE_MIN_MS = 170;
const EXIT_SLIDE_MAX_MS = 720;
/** px/ms — gentle drag / slow release */
const EXIT_VELOCITY_SLOW = 0.1;
/** px/ms — hard flick */
const EXIT_VELOCITY_FAST = 1.6;

/** Maps swipe speed to exit duration: fast flicks snap off, gentle drags linger. */
export function getExitSlideMs(
  releaseVelocityPxPerMs: number,
  gestureDurationMs: number,
  distancePx: number,
): number {
  const avgVelocity = distancePx / Math.max(gestureDurationMs, 16);
  const effectiveVelocity = Math.max(releaseVelocityPxPerMs, avgVelocity);
  const t = Math.min(
    1,
    Math.max(
      0,
      (effectiveVelocity - EXIT_VELOCITY_SLOW) /
        (EXIT_VELOCITY_FAST - EXIT_VELOCITY_SLOW),
    ),
  );

  return Math.round(EXIT_SLIDE_MAX_MS - t * (EXIT_SLIDE_MAX_MS - EXIT_SLIDE_MIN_MS));
}

/** Scatter offset + rotate + scale only — vertical centering is on the outer wrapper */
export function poseToTransform(pose: CardPose): string {
  return `translate3d(${pose.x}px, ${pose.y}px, 0) rotate(${pose.rotateDeg}deg) scale(${pose.scale})`;
}

export const WORK_CAROUSEL_INDEX_KEY = "workCarouselIndex";

/** Front slide + each back card grow, one after another. */
export function getPileEnterDurationMs(): number {
  return ENTER_SLIDE_MS + (CARD_COUNT - 1) * ENTER_BACK_GROW_MS;
}
