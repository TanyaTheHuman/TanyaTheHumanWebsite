"use client";

import { useEffect, useRef, useState } from "react";

const SAMPLE = "the quick brown fox jumped over the lazy dog";

const BASE_PX = 16;

function remToPx(rem: number) {
  return Math.round(rem * BASE_PX);
}

function lineHeightPx(fontSizeRem: number, lineHeight: number) {
  return Math.round(remToPx(fontSizeRem) * lineHeight * 10) / 10;
}

const styles: {
  name: string;
  className: string;
  fontSizeRem: number;
  lineHeight: number;
}[] = [
  { name: "H1", className: "h1", fontSizeRem: 5, lineHeight: 1.1 },
  {
    name: "H1 Italic",
    className: "h1-italic",
    fontSizeRem: 5,
    lineHeight: 1.1,
  },
  { name: "H2", className: "h2", fontSizeRem: 3.75, lineHeight: 1.1 },
  {
    name: "H2 Italic",
    className: "h2-italic",
    fontSizeRem: 3.75,
    lineHeight: 1.1,
  },
  { name: "H3", className: "h3", fontSizeRem: 3, lineHeight: 1.1 },
  {
    name: "H3 Italic",
    className: "h3-italic",
    fontSizeRem: 3,
    lineHeight: 1.1,
  },
  { name: "H4", className: "h4", fontSizeRem: 2.5, lineHeight: 1.2 },
  { name: "H5", className: "h5", fontSizeRem: 2.125, lineHeight: 1.2 },
  { name: "H6", className: "h6", fontSizeRem: 1.5, lineHeight: 1.2 },
  {
    name: "Subtitle",
    className: "subtitle",
    fontSizeRem: 1.25,
    lineHeight: 1.2,
  },
  {
    name: "Body Large",
    className: "body-large",
    fontSizeRem: 1.125,
    lineHeight: 1.3,
  },
  {
    name: "Body Large Italic",
    className: "body-large-italic",
    fontSizeRem: 1.125,
    lineHeight: 1.3,
  },
  {
    name: "Body Default",
    className: "body-default",
    fontSizeRem: 1,
    lineHeight: 1.2,
  },
  {
    name: "Body Default Italic",
    className: "body-default-italic",
    fontSizeRem: 1,
    lineHeight: 1.3,
  },
  {
    name: "Body Default Bold",
    className: "body-default-bold",
    fontSizeRem: 1,
    lineHeight: 1.3,
  },
  { name: "Caption", className: "caption", fontSizeRem: 0.75, lineHeight: 1.4 },
];

const footnoteStyle = {
  name: "Footnote",
  className: "footnote",
  fontSizePx: 10,
  lineHeight: 0.88,
};

type ComputedSize = { fontSizePx: number; lineHeightPx: number } | null;

export default function TypeTestPage() {
  const sampleRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const footnoteRef = useRef<HTMLParagraphElement | null>(null);
  const [computed, setComputed] = useState<ComputedSize[]>(() =>
    styles.map(() => null),
  );
  const [footnoteComputed, setFootnoteComputed] = useState<ComputedSize | null>(
    null,
  );

  function measure() {
    const next = sampleRefs.current.map((el) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      const fs = parseFloat(s.fontSize);
      const lh =
        s.lineHeight === "normal" ? fs * 1.2 : parseFloat(s.lineHeight);
      return {
        fontSizePx: Math.round(fs * 10) / 10,
        lineHeightPx: Math.round(lh * 10) / 10,
      };
    });
    setComputed(next);

    if (footnoteRef.current) {
      const s = getComputedStyle(footnoteRef.current);
      const fs = parseFloat(s.fontSize);
      const lh =
        s.lineHeight === "normal" ? fs * 1.2 : parseFloat(s.lineHeight);
      setFootnoteComputed({
        fontSizePx: Math.round(fs * 10) / 10,
        lineHeightPx: Math.round(lh * 10) / 10,
      });
    }
  }

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  return (
    <main className="bg-cream min-h-screen px-0 py-8 md:px-0 md:py-12">
      <div className="mx-auto max-w-[1000px]">
        <p className="body-default text-ink mb-12">
          Base font size: {BASE_PX}px. Each sample uses the sentence &ldquo;
          {SAMPLE}&rdquo;. Values below show the <strong>computed</strong> size
          (updates on resize).
        </p>

        <div className="flex w-full flex-col gap-12">
          {styles.map((s, i) => (
            <section
              key={s.className}
              className="border-b border-stone-300 pb-10"
            >
              <p className="caption mb-2 font-sans font-semibold tracking-wide text-stone-500 uppercase">
                {s.name}
              </p>
              <p
                ref={(el) => {
                  sampleRefs.current[i] = el;
                }}
                className={`${s.className} text-ink`}
              >
                {SAMPLE}
              </p>
              <p className="caption mt-3 font-mono text-stone-500">
                {computed[i] ? (
                  <>
                    font-size: <strong>{computed[i]!.fontSizePx}px</strong> ·
                    line-height: {computed[i]!.lineHeightPx}px
                  </>
                ) : (
                  <>
                    font-size: {s.fontSizeRem}rem ({remToPx(s.fontSizeRem)}px) ·
                    line-height: {s.lineHeight} (
                    {lineHeightPx(s.fontSizeRem, s.lineHeight)}px)
                  </>
                )}
              </p>
            </section>
          ))}

          <section className="border-b border-stone-300 pb-10">
            <p
              ref={footnoteRef}
              className={`${footnoteStyle.className} text-ink`}
            >
              {SAMPLE}
            </p>
            <p className="caption mt-3 font-mono text-stone-500">
              {footnoteComputed ? (
                <>
                  font-size: <strong>{footnoteComputed.fontSizePx}px</strong> ·
                  line-height: {footnoteComputed.lineHeightPx}px
                </>
              ) : (
                <>
                  font-size: {footnoteStyle.fontSizePx}px · line-height:{" "}
                  {footnoteStyle.lineHeight} (
                  {Math.round(
                    footnoteStyle.fontSizePx * footnoteStyle.lineHeight * 10,
                  ) / 10}
                  px)
                </>
              )}
            </p>
          </section>
        </div>

        <p className="body-default mt-12 text-stone-500">
          Hero-only styles (hero-title, hero-title-italic) use clamp(3rem, 10vw,
          5rem) and scale with viewport; not shown here.
        </p>
      </div>
    </main>
  );
}
