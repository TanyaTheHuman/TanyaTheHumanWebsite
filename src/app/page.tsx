"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CrosswordInteractive,
  type CrosswordInteractiveHandle,
} from "@/components/CrosswordSection";
import Image from "next/image";

function displayWord(filledWords: Record<string, string>, key: string): string {
  const word = filledWords[key];
  if (!word) return key.replace(/-/g, "\u2011");
  if (key === "22-across" && word.toUpperCase() === "PRODUCTDESIGNER") {
    return "Product designer";
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export default function Home() {
  const crosswordRef = useRef<CrosswordInteractiveHandle>(null);
  const [filledWords, setFilledWords] = useState<Record<string, string>>({});

  const scrollToCrosswordWord = useCallback(
    (clueNumber: number, direction: "across" | "down") => {
      document
        .getElementById("crossword")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      crosswordRef.current?.scrollToWord(clueNumber, direction);
    },
    [],
  );

  // TEMPORARY: Breakpoint indicator for responsive debugging
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCurrentBreakpoint = useCallback(() => {
    if (windowWidth === 0) return "Loading...";
    if (windowWidth >= 1536) return "2xl (≥1536px)";
    if (windowWidth >= 1280) return "xl (≥1280px)";
    if (windowWidth >= 1024) return "lg (≥1024px)";
    if (windowWidth >= 768) return "md (≥768px)";
    if (windowWidth >= 640) return "sm (≥640px)";
    return `default (<640px)`;
  }, [windowWidth]);

  return (
    <>
      <section
        className="flex h-fit flex-col items-center gap-[104px] self-stretch"
        aria-label="Hero"
      >
        <div className="flex h-svh w-dvw items-center justify-center px-14 py-8 max-sm:px-4 max-sm:py-4">
          <div className="relative flex h-full w-full items-center border border-stone-700">
            <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-end gap-2 text-center sm:flex-row sm:items-center sm:text-left">
              <p className="caption bg-cream absolute top-0 right-0 left-0 mx-auto w-fit -translate-y-1/2 px-4 py-2 text-center text-stone-600">
                Designer of things
              </p>
              <Image
                src="/header-back.png"
                alt="Tanya profile picture"
                height={1144}
                width={777}
                className="mx-auto aspect-285/566 h-auto w-[140px] object-contain sm:mx-0 sm:w-[220px] md:w-[260px] lg:w-[280px] xl:w-[320px] 2xl:w-[480px]"
              />
              <div className="flex w-full min-w-0 flex-col items-center gap-8 text-center sm:w-[598px] sm:items-start sm:text-left">
                <div className="flex flex-col items-center self-center text-center sm:items-start sm:self-start sm:text-left">
                  <h2 className="h2 text-stone-800">
                    <span className="-ml-3">Tanya,</span>
                    <br />
                    <span className="inline-block whitespace-nowrap">
                      the{" "}
                      <span className="h2-italic bg-mustard-300/25 text-mustard-900 relative inline-block rounded">
                        human
                      </span>
                    </span>
                  </h2>
                  <p className="body-large text-ink wrap-break-words mt-6 max-w-xs min-w-0 text-pretty sm:max-w-sm">
                    A{" "}
                    <a
                      href="#crossword"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToCrosswordWord(22, "across");
                      }}
                      className="hover:bg-mustard-100 focus:bg-mustard-100 rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "22-across")}
                      {"    "}
                    </a>
                    based in{" "}
                    <a
                      href="#crossword"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToCrosswordWord(30, "down");
                      }}
                      className="hover:bg-mustard-100 focus:bg-mustard-100 rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "30-down")}
                    </a>
                    , currently at{" "}
                    <a
                      href="#crossword"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToCrosswordWord(10, "across");
                      }}
                      className="hover:bg-mustard-100 focus:bg-mustard-100 rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "10-across")}
                    </a>
                    , previously at{" "}
                    <a
                      href="#crossword"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToCrosswordWord(31, "across");
                      }}
                      className="hover:bg-mustard-100 focus:bg-mustard-100 rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "31-across")}
                    </a>
                  </p>
                </div>
              </div>
              <p className="caption bg-cream absolute right-0 bottom-0 left-0 mx-auto w-fit translate-y-1/2 px-4 py-2 text-center text-stone-600">
                Enjoyer of puzzles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEMPORARY: Breakpoint indicator - remove when done */}
      {/* <div className="flex w-full justify-center px-8 pt-8">
        <div className="rounded border-2 border-stone-600 bg-stone-200 p-3 text-center font-mono text-sm font-semibold text-stone-800">
          Breakpoint: {getCurrentBreakpoint()} | Width: {windowWidth}px
        </div>
      </div> */}

      <div id="crossword" className="crossword-section">
        <CrosswordInteractive
          ref={crosswordRef}
          onFilledWordsChange={setFilledWords}
        />
      </div>

      <section className="flex flex-col items-center self-stretch px-[56px] pt-[200px] pb-[320px]">
        <div className="flex flex-col items-center">
          <Image
            src="/ok-bye.png"
            alt="Woman waving goodbye with a peace sign"
            height={1231}
            width={679}
            className="xsm:max-w-[105px] h-auto max-w-[84px] sm:max-w-[140px]"
          />
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="h-px w-16 bg-stone-400"></div>
            <p className="body-default">
              Ok, <span className="body-default-italic">bye</span>
            </p>
            <div className="h-px w-16 bg-stone-400"></div>
          </div>
        </div>
      </section>
    </>
  );
}
