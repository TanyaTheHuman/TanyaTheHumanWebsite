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
      <div className="m-8 flex flex-col border border-border min-h-auto h-auto">
        <header className="flex items-center justify-center -mt-px pt-0">
          <p className="text-sm whitespace-nowrap px-4 py-4 bg-cream relative -top-[9px]">Come back soon.</p>
        </header>
        <main className="flex flex-col items-center px-8 pt-[104px] pb-[104px]">
          <h1 className="h1 text-center font-normal">
            New site
            <br />
            coming <span className="italic">soonish.</span>
          </h1>
        </main>
        <footer className="flex items-center justify-center -mb-px pb-0">
          <p className="text-sm whitespace-nowrap px-4 py-4 bg-cream relative -bottom-[9px]">But not too soon.</p>
        </footer>
      </div>
      
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
    </>
  );
}
