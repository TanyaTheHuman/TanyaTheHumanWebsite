"use client";

import { WORK_ITEMS } from "@/lib/work-items";
import {
  WORK_PILE_TONES,
  CARD_COUNT,
  getPileScatterTopInset,
  type PileAnimation,
} from "@/lib/work-pile-math";
import {
  WorkPileCard,
  type DragOffset,
} from "@/components/WorkPileCard";
import type { PileEnterStep } from "@/hooks/useWorkPileEnter";

type WorkPileStageProps = {
  activeIndex: number;
  pileTopIndex: number;
  animation: PileAnimation | null;
  displacedTopIndex: number | null;
  enterStep?: PileEnterStep;
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
  enterStep = CARD_COUNT + 1,
  dragOffset = null,
  dragTransition,
  stageClassName = "",
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: WorkPileStageProps) {
  const scatterTopInset = getPileScatterTopInset();

  return (
    <div
      className={`flex min-h-0 flex-1 touch-none flex-col overflow-visible pb-[max(1rem,env(safe-area-inset-bottom,0px))] select-none ${stageClassName}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/*
        Peek band + card lane: width sets card size (Figma scale); max-h-full
        shrinks the lane only when vertical space is tight.
      */}
      <div className="@container/pile relative mx-auto flex min-h-0 w-[calc((100%-4rem)*0.94)] max-w-[calc((min(100%,1200px)-4rem)*0.94)] flex-1 flex-col overflow-visible">
        <div
          className="shrink-0"
          style={{ height: scatterTopInset }}
          aria-hidden="true"
        />
        <div className="relative flex min-h-0 flex-1 items-start justify-center overflow-visible">
          <div
            className="relative aspect-[4/3] w-full max-w-full overflow-visible"
            style={{ height: "auto", maxHeight: "100%" }}
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
            enterStep={enterStep}
            toneClassName={WORK_PILE_TONES[index % WORK_PILE_TONES.length]}
            dragOffset={dragOffset}
            dragTransition={dragTransition}
          />
        ))}
          </div>
        </div>
      </div>
    </div>
  );
}
