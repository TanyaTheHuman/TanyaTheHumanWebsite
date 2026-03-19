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
          <div className="relative flex h-full w-full items-center border border-stone-400">
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
                  className="aspect-285/566 w-1/2 object-contain filter-[url(#pixelate)] sm:w-full"
                />

                <svg className="sr-only">
                  <defs>
                    <filter id="pixelate" x="0" y="0">
                      <feMorphology
                        result="b"
                        in="SourceGraphic"
                        operator="erode"
                        radius="10"
                      >
                        <animate
                          attributeName="radius"
                          values="10;0"
                          calcMode="linear"
                          dur="2s"
                          fill="freeze"
                          begin=".25s"
                          repeatCount="1"
                        />
                      </feMorphology>
                      <feComponentTransfer in="b" result="aFaded">
                        <feFuncA type="gamma" exponent="1" amplitude="0">
                          <animate
                            attributeName="amplitude"
                            calcMode="spline"
                            values="0;0.15;0.3;0.9;1"
                            keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1"
                            keyTimes="0;0.25;0.5;0.75;1"
                            dur="2s"
                            fill="freeze"
                            begin="0.25s"
                            repeatCount="1"
                          />
                        </feFuncA>
                      </feComponentTransfer>
                    </filter>
                  </defs>
                </svg>
                <div className="flex flex-col items-center self-center text-center sm:items-start sm:text-left">
                  <h2 className="h2 text-stone-800">
                    <span className="-ml-3">Tanya,</span>
                    <br />
                    <span className="inline-block whitespace-nowrap">
                      the{" "}
                      <span className="h2-italic text-mustard-900 relative inline-block rounded">
                        human
                        <div className="from-mustard-300/30 to-mustard-300/20 absolute inset-y-0 -right-4 left-0 z-[-1] rounded bg-linear-to-r opacity-100 transition-all delay-250 duration-500 ease-in-out starting:right-full starting:opacity-0"></div>
                      </span>
                    </span>
                  </h2>
                  <p className="body-large text-ink wrap-break-words mt-6 max-w-xs min-w-0 text-pretty sm:max-w-sm">
                    A{" "}
                    <a
                      // href="#crossword"
                      onClick={(e) => {
                        e.preventDefault();
                        activateCrosswordWord(15, "across");
                        document.getElementById("crossword")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="hover:bg-mustard-100 link focus:bg-mustard-100 cursor-pointer rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "15-across")}
                      {"    "}
                    </a>
                    based in{" "}
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        activateCrosswordWord(23, "down");
                        document.getElementById("crossword")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="hover:bg-mustard-100 link focus:bg-mustard-100 cursor-pointer rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "23-down")}
                    </a>
                    , currently at{" "}
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        activateCrosswordWord(6, "across");
                        document.getElementById("crossword")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="hover:bg-mustard-100 link focus:bg-mustard-100 cursor-pointer rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "6-across")}
                    </a>
                    , previously at{" "}
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        activateCrosswordWord(25, "across");
                        document.getElementById("crossword")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="hover:bg-mustard-100 link focus:bg-mustard-100 cursor-pointer rounded italic underline opacity-80 transition-all duration-200 hover:opacity-100 focus:outline-none"
                    >
                      {displayWord(filledWords, "25-across")}
                    </a>
                    .
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
          <a
            target="_blank"
            href="https://www.linkedin.com/in/tanya-the-human/"
            className="hover:text-mustard-500 mt-6 text-stone-700 transition-colors duration-100"
          >
            <svg
              className="size-6 fill-current"
              height="24"
              width="24"
              fill="currentColor"
              viewBox="0 0 20 19"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.43994 2.19729C4.43968 2.72772 4.22871 3.23632 3.85345 3.61121C3.47819 3.9861 2.96937 4.19655 2.43894 4.19629C1.90851 4.19602 1.39991 3.98506 1.02502 3.6098C0.650136 3.23454 0.439676 2.72572 0.439942 2.19529C0.440207 1.66486 0.651175 1.15625 1.02644 0.781368C1.4017 0.406483 1.91051 0.196024 2.44094 0.196289C2.97137 0.196555 3.47998 0.407522 3.85486 0.782783C4.22975 1.15804 4.44021 1.66686 4.43994 2.19729ZM4.49994 5.67729H0.499942V18.1973H4.49994V5.67729ZM10.8199 5.67729H6.83994V18.1973H10.7799V11.6273C10.7799 7.96729 15.5499 7.62729 15.5499 11.6273V18.1973H19.4999V10.2673C19.4999 4.09729 12.4399 4.32729 10.7799 7.35729L10.8199 5.67729Z" />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
