"use client";

import { useState, useEffect, useCallback } from "react";
import { CrosswordInteractive } from "@/components/CrosswordSection";

export default function Home() {
  // TEMPORARY: Breakpoint indicator for responsive debugging
  const [windowWidth, setWindowWidth] = useState<number>(0);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Set initial width
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const getCurrentBreakpoint = useCallback(() => {
    if (windowWidth === 0) return 'Loading...';
    if (windowWidth >= 1536) return '2xl (≥1536px)';
    if (windowWidth >= 1280) return 'xl (≥1280px)';
    if (windowWidth >= 1024) return 'lg (≥1024px)';
    if (windowWidth >= 768) return 'md (≥768px)';
    if (windowWidth >= 640) return 'sm (≥640px)';
    return `default (<640px)`;
  }, [windowWidth]);

  return (
    <>
      <section
        className="flex flex-col items-center self-stretch py-[120px] px-[56px] gap-[120px]"
        aria-label="Hero"
      >
        <p className="caption text-stone-600">Designer of things</p>

        <div className="flex flex-row items-center gap-8 justify-center w-full max-w-[1200px]">
          <img
            src="/header-back.png"
            alt=""
            className="w-[385px] h-[566px] object-contain"
          />
          <div className="flex flex-col gap-12 min-w-0">
            <h1 className="h1 text-stone-800">
              Tanya,
              <br />
              the{" "}
              <span className="relative inline-block">
                <span
                  className="absolute inset-0 bg-mustard-300/25 rounded"
                  aria-hidden
                />
                <span className="relative z-10 h1-italic text-mustard-900">
                  human
                </span>
              </span>
            </h1>
            <p className="h6 text-ink">
              Hello. I'm a{" "}
              <a href="#">24-across</a> based in{" "}
              <a href="#">31-down</a>. Currently an IC and
              team-lead at <a href="#">11-across</a>,
              previously at <a href="#">32-across</a>.
            </p>
          </div>
        </div>

        <p className="caption text-stone-600">Enjoyer of puzzles</p>
      </section>

      {/* TEMPORARY: Breakpoint indicator - remove when done */}
      <div 
        className="w-full flex justify-center px-8 pt-8"
      >
        <div className="p-3 bg-stone-200 rounded text-center font-mono text-sm font-semibold text-stone-800 border-2 border-stone-600">
          Breakpoint: {getCurrentBreakpoint()} | Width: {windowWidth}px
        </div>
      </div>
      
      <div className="crossword-section">
        <CrosswordInteractive />
      </div>

      <section className="flex flex-col items-center self-stretch py-[158px] px-[56px] gap-0">
        <img
          src="/ok-bye.png"
          alt="Woman waving goodbye with a peace sign"
          className="max-w-[140px] h-auto"
        />
        <p className="body-large">
          Ok, <span className="body-large-italic">bye</span>
        </p>
      </section>
    </>
  );
}
