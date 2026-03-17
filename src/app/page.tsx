"use client";

import { useState, useCallback, useRef } from "react";
import {
  CrosswordInteractive,
  type CrosswordInteractiveHandle,
} from "@/components/CrosswordSection";
import Image from "next/image";

function displayWord(filledWords: Record<string, string>, key: string): string {
  const word = filledWords[key];
  if (!word) return key.replace(/-/g, "\u2011");
  if (key === "15-across" && word.toUpperCase() === "PRODUCTDESIGNER") {
    return "Product designer";
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export default function Home() {
  const crosswordRef = useRef<CrosswordInteractiveHandle>(null);
  const [filledWords, setFilledWords] = useState<Record<string, string>>({});

  const activateCrosswordWord = useCallback(
    (clueNumber: number, direction: "across" | "down") => {
      crosswordRef.current?.scrollToWord(clueNumber, direction);
    },
    [],
  );

  return (
    <>
      <section
        className="flex h-fit flex-col items-center gap-[104px] self-stretch"
        aria-label="Hero"
      >
        <div className="flex h-svh w-dvw items-center justify-center px-14 py-8 max-sm:px-4 max-sm:py-4">
          <div className="relative flex h-full w-full items-center border border-stone-700">
            <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-end gap-2 text-center sm:flex-row sm:items-center sm:text-left">
              <p className="caption bg-cream absolute inset-x-0 top-0 mx-auto w-fit -translate-y-1/2 px-4 py-2 text-center text-stone-600">
                Designer of things
              </p>

              <div className="grid min-w-0 items-center justify-items-center sm:grid-cols-[1fr_auto] sm:gap-8">
                <Image
                  src="/header-back.png"
                  alt="Tanya profile picture"
                  height={1144}
                  width={777}
                  className="aspect-285/566 w-full object-contain max-sm:w-1/2"
                />
                <div className="flex flex-col items-center self-center text-center sm:items-start sm:text-left">
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
                        // e.preventDefault();
                        activateCrosswordWord(15, "across");
                      }}
                      className="hover:bg-mustard-100 focus:bg-mustard-100 rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "15-across")}
                      {"    "}
                    </a>
                    based in{" "}
                    <a
                      href="#crossword"
                      onClick={(e) => {
                        // e.preventDefault();
                        activateCrosswordWord(23, "down");
                      }}
                      className="hover:bg-mustard-100 focus:bg-mustard-100 rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "23-down")}
                    </a>
                    , currently at{" "}
                    <a
                      href="#crossword"
                      onClick={(e) => {
                        // e.preventDefault();
                        activateCrosswordWord(6, "across");
                      }}
                      className="hover:bg-mustard-100 focus:bg-mustard-100 rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "6-across")}
                    </a>
                    , previously at{" "}
                    <a
                      href="#crossword"
                      onClick={(e) => {
                        // e.preventDefault();
                        activateCrosswordWord(25, "across");
                      }}
                      className="hover:bg-mustard-100 focus:bg-mustard-100 rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "25-across")}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <p className="caption bg-cream absolute right-0 bottom-0 left-0 mx-auto w-fit translate-y-1/2 px-4 py-2 text-center text-stone-600">
              Enjoyer of puzzles
            </p>
          </div>
        </div>
      </section>

      <div className="crossword-section">
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
