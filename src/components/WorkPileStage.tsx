"use client";

import { WORK_ITEMS } from "@/lib/work-items";
import { WORK_PILE_TONES } from "@/lib/work-pile-math";
import {
  WorkPileCard,
  type DragOffset,
} from "@/components/WorkPileCard";
import type { PileAnimation } from "@/lib/work-pile-math";

type WorkPileStageProps = {
  activeIndex: number;
  pileTopIndex: number;
  animation: PileAnimation | null;
  displacedTopIndex: number | null;
  dragOffset?: DragOffset;
  dragTransition?: string;
  stageClassName?: string;
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<HTMLDivElement>) => void;
};

export function WorkPileStage({
  activeIndex,
  pileTopIndex,
  animation,
  displacedTopIndex,
  dragOffset = null,
  dragTransition,
  stageClassName = "",
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: WorkPileStageProps) {
  return (
    <div
      className={`relative flex min-h-0 flex-1 items-center justify-center touch-none select-none ${
        animation ? "overflow-visible" : "overflow-x-clip overflow-y-clip"
      } ${stageClassName}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {WORK_ITEMS.map((item, index) => (
        <WorkPileCard
          key={item.id}
          item={item}
          itemIndex={index}
          activeIndex={activeIndex}
          pileTopIndex={pileTopIndex}
          animation={animation}
          displacedTopIndex={displacedTopIndex}
          toneClassName={WORK_PILE_TONES[index % WORK_PILE_TONES.length]}
          dragOffset={dragOffset}
          dragTransition={dragTransition}
        />
      ))}
    </div>
  );
}
