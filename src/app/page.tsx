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
      <div className="frame hero">
        <header className="border-row top">
          <p className="border-text">Come back soon.</p>
        </header>
        <main className="flex flex-col items-center px-8" style={{ paddingTop: 104, paddingBottom: 104 }}>
          <h1 className="main-heading text-center font-normal">
            New site
            <br />
            coming <span className="italic">soonish.</span>
          </h1>
        </main>
        <footer className="border-row bottom">
          <p className="border-text">But not too soon.</p>
        </footer>
      </div>
      
      {/* TEMPORARY: Breakpoint indicator - remove when done */}
      <div 
        className="w-full flex justify-center px-8 pt-8"
      >
        <div 
          className="p-3 bg-stone-200 rounded text-center"
          style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: 600,
            color: '#292524',
            border: '2px solid #57534e',
          }}
        >
          Breakpoint: {getCurrentBreakpoint()} | Width: {windowWidth}px
        </div>
      </div>
      
      <div className="crossword-section">
        <CrosswordInteractive />
      </div>
    </>
  );
}
