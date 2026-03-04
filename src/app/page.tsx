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
        className="flex flex-col items-center self-stretch py-[80px] px-[56px] gap-[80px]"
        aria-label="Hero"
      >
        <p className="caption text-stone-600 text-center sm:text-left">Designer of things</p>

        <div className="flex flex-col items-center text-center gap-3 justify-center w-full max-w-[1200px] sm:flex-row sm:items-center sm:text-left">
          <img
            src="/header-back.png"
            alt=""
            className="w-[140px] h-auto object-contain mx-auto sm:w-[220px] md:w-[260px] lg:w-[360px] xl:w-[420px] 2xl:w-[480px]"
          />
          <div className="flex flex-col gap-12 min-w-0 items-center text-center w-full sm:w-[598px] sm:items-start sm:text-left">
            <h1 className="hero-title text-stone-800">
              Tanya,
              <br />
              <span className="inline-block whitespace-nowrap">
                the{" "}
                <span className="relative inline-block">
                  <span
                    className="absolute inset-0 bg-mustard-300/25 rounded"
                    aria-hidden
                  />
                  <span className="relative z-10 hero-title-italic text-mustard-900">
                    human
                  </span>
                </span>
              </span>
            </h1>
            <p className="h6 text-ink w-full">
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

      <section className="flex flex-col items-center self-stretch py-[200px] px-[56px] gap-0">
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
