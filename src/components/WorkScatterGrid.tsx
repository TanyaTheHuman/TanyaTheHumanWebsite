"use client";

import { useState } from "react";
import { WorkCard } from "@/components/WorkCard";
import { useWorkEnterPhase } from "@/hooks/useWorkPileEnter";
import { ENTER_BOUNCE_EASE } from "@/lib/work-pile-math";
import { getScatterEnterOffset } from "@/lib/work-scatter-enter";
import { WORK_ITEMS, type WorkItem, type WorkItemScatter } from "@/lib/work-items";

/** Figma artboard 2888:70 — width / height */
const SCATTER_ASPECT = 2462 / 1769;

/** Soft ease-out — gentle start and settle */
const HOVER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const HOVER_DURATION_MS = 650;

/** Extra gap after clearing overlap (% of canvas) */
const CLEARANCE_PADDING = 4;

/** Inflate hovered bounds to account for card rotation */
const HOVER_BOX_INFLATE = 3;

type Box = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

function parsePercent(value: string): number {
  return parseFloat(value.replace("%", ""));
}

function getCardBox(scatter: WorkItemScatter, inflate = 0): Box {
  const left = parsePercent(scatter.left) - inflate;
  const top = parsePercent(scatter.top) - inflate;
  const width = parsePercent(scatter.width) + inflate * 2;
  const height = width * (3 / 4) * SCATTER_ASPECT + inflate * 2;

  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
  };
}

function boxesOverlap(a: Box, b: Box): boolean {
  return (
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );
}

/** Minimum % translation so `other` no longer covers `hovered` (plus padding). */
function getClearanceOffset(hovered: Box, other: Box, padding: number): {
  dx: number;
  dy: number;
} {
  let dx = 0;
  let dy = 0;

  const target: Box = {
    left: hovered.left - padding,
    top: hovered.top - padding,
    right: hovered.right + padding,
    bottom: hovered.bottom + padding,
  };

  if (other.left < target.right && other.right > target.left) {
    const otherCx = (other.left + other.right) / 2;
    const hoveredCx = (hovered.left + hovered.right) / 2;
    dx =
      otherCx >= hoveredCx
        ? target.right - other.left
        : target.left - other.right;
  }

  if (other.top < target.bottom && other.bottom > target.top) {
    const otherCy = (other.top + other.bottom) / 2;
    const hoveredCy = (hovered.top + hovered.bottom) / 2;
    dy =
      otherCy >= hoveredCy
        ? target.bottom - other.top
        : target.top - other.bottom;
  }

  return { dx, dy };
}

function getCardTransform(
  item: WorkItem,
  hoveredItem: WorkItem | null,
  enterOffset: { dx: number; dy: number } | null,
): string {
  const { rotateDeg } = item.scatter;
  let dx = enterOffset?.dx ?? 0;
  let dy = enterOffset?.dy ?? 0;

  if (!hoveredItem) {
    if (dx === 0 && dy === 0) {
      return `rotate(${rotateDeg}deg)`;
    }
    return `translate(${dx}%, ${dy}%) rotate(${rotateDeg}deg)`;
  }

  if (hoveredItem.id === item.id) {
    if (dx === 0 && dy === 0) {
      return "rotate(0deg)";
    }
    return `translate(${dx}%, ${dy}%) rotate(0deg)`;
  }

  // Cards below the hovered one cannot obscure it — leave them in place
  if (item.scatter.zIndex < hoveredItem.scatter.zIndex) {
    if (dx === 0 && dy === 0) {
      return `rotate(${rotateDeg}deg)`;
    }
    return `translate(${dx}%, ${dy}%) rotate(${rotateDeg}deg)`;
  }

  const hoveredBox = getCardBox(hoveredItem.scatter);
  const hoveredReveal = getCardBox(hoveredItem.scatter, HOVER_BOX_INFLATE);
  const otherBox = getCardBox(item.scatter);

  if (boxesOverlap(hoveredReveal, otherBox)) {
    const clearance = getClearanceOffset(
      hoveredBox,
      otherBox,
      CLEARANCE_PADDING,
    );
    dx += clearance.dx;
    dy += clearance.dy;
  }

  if (dx === 0 && dy === 0) {
    return `rotate(${rotateDeg}deg)`;
  }

  return `translate(${dx}%, ${dy}%) rotate(${rotateDeg}deg)`;
}

export function WorkScatterGrid() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { enterPhase } = useWorkEnterPhase(HOVER_DURATION_MS);
  const isEntering = enterPhase !== "done";
  const hoveredItem =
    WORK_ITEMS.find((item) => item.id === hoveredId) ?? null;
  const effectiveHovered = isEntering ? null : hoveredItem;
  const tones = [
    "bg-stone-50",
    "bg-amber-50",
    "bg-emerald-50",
    "bg-sky-50",
    "bg-rose-50",
  ] as const;

  const motionTransition = `transform ${HOVER_DURATION_MS}ms ${HOVER_EASE}, box-shadow ${HOVER_DURATION_MS}ms ${HOVER_EASE}, opacity ${HOVER_DURATION_MS}ms ${HOVER_EASE}`;
  const enterTransition = `transform ${HOVER_DURATION_MS}ms ${ENTER_BOUNCE_EASE}, box-shadow ${HOVER_DURATION_MS}ms ${ENTER_BOUNCE_EASE}, opacity ${HOVER_DURATION_MS}ms ease-out`;

  return (
    <ul
      className="relative m-0 w-full min-h-[min(72vw,560px)] list-none overflow-visible p-0 sm:min-h-0"
      style={{ aspectRatio: SCATTER_ASPECT }}
      onMouseLeave={() => {
        if (!isEntering) setHoveredId(null);
      }}
    >
      {WORK_ITEMS.map((item) => {
        const isHovered = effectiveHovered?.id === item.id;
        const isRevealed = effectiveHovered != null && !isHovered;
        const toneClassName = tones[Math.abs(item.scatter.zIndex) % tones.length];
        const enterOffset =
          enterPhase === "pending"
            ? getScatterEnterOffset(item)
            : enterPhase === "active"
              ? { dx: 0, dy: 0 }
              : null;

        return (
          <li
            key={item.id}
            className={`absolute origin-center transform-gpu overflow-visible will-change-transform shadow-none ${
              isHovered ? "shadow-[0_20px_48px_rgba(0,0,0,0.16)]" : ""
            }`}
            style={{
              left: item.scatter.left,
              top: item.scatter.top,
              width: item.scatter.width,
              zIndex: item.scatter.zIndex,
              transform: getCardTransform(item, effectiveHovered, enterOffset),
              transition:
                enterPhase === "pending"
                  ? "none"
                  : isEntering
                    ? enterTransition
                    : motionTransition,
              opacity: isRevealed ? 0.92 : 1,
            }}
            tabIndex={0}
            onMouseEnter={() => {
              if (!isEntering) setHoveredId(item.id);
            }}
            onFocus={() => {
              if (!isEntering) setHoveredId(item.id);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setHoveredId(null);
              }
            }}
          >
            <WorkCard title={item.title} toneClassName={toneClassName} />
          </li>
        );
      })}
    </ul>
  );
}
