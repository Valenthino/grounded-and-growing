"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { flipbookPages } from "@/lib/content";

const FLIP_MS = 750;
const pages = flipbookPages;
/** Spread 0 is the closed cover; afterwards: left = pages[2s-1], right = pages[2s]. */
const spreadCount = 1 + Math.ceil((pages.length - 1) / 2);

const leftOf = (s: number) => (s > 0 ? pages[2 * s - 1] : undefined);
const rightOf = (s: number) => pages[2 * s];

function PageFace({ page, side }: { page?: (typeof pages)[number]; side: "left" | "right" }) {
  if (!page) {
    return (
      <div
        className={`h-full w-full bg-espresso-deep ring-1 ring-black/20 ${side === "left" ? "rounded-l-md" : "rounded-r-md"}`}
      />
    );
  }
  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-paper ring-1 ring-black/15 ${
        side === "left" ? "rounded-l-md" : "rounded-r-md"
      }`}
    >
      <Image
        src={page.src}
        alt={`${page.title} — ${page.caption}`}
        fill
        sizes="(min-width: 768px) 390px, 88vw"
        className="object-cover"
      />
      {/* spine shading */}
      <div
        className={`pointer-events-none absolute inset-y-0 w-10 ${
          side === "left"
            ? "right-0 bg-gradient-to-l from-black/15 to-transparent"
            : "left-0 bg-gradient-to-r from-black/15 to-transparent"
        }`}
      />
    </div>
  );
}

/** Two-page spread with a 3D turning sheet (desktop). */
function SpreadBook() {
  const [spread, setSpread] = useState(0);
  const [flip, setFlip] = useState<{ dir: "next" | "prev"; target: number } | null>(null);
  const [run, setRun] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback(
    (dir: "next" | "prev") => {
      if (flip) return;
      const target = dir === "next" ? spread + 1 : spread - 1;
      if (target < 0 || target >= spreadCount) return;
      setFlip({ dir, target });
      setRun(false);
    },
    [flip, spread],
  );

  // kick the sheet rotation one frame after it mounts, then commit
  useEffect(() => {
    if (!flip) return;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setRun(true)),
    );
    timer.current = setTimeout(() => {
      setSpread(flip.target);
      setFlip(null);
      setRun(false);
    }, FLIP_MS + 60);
    return () => {
      cancelAnimationFrame(raf);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [flip]);

  // While flipping forward the static right shows the NEXT right page;
  // flipping backward the static left shows the PREVIOUS left page.
  const staticLeft = flip?.dir === "prev" ? leftOf(flip.target) : leftOf(spread);
  const staticRight = flip?.dir === "next" ? rightOf(flip.target) : rightOf(spread);
  const sheetFront = flip?.dir === "next" ? rightOf(spread) : rightOf(flip?.target ?? 0);
  const sheetBack = flip?.dir === "next" ? leftOf(flip.target) : leftOf(spread);

  const closed = spread === 0 && flip === null;
  const label = closed
    ? pages[0].title
    : [leftOf(flip ? flip.target : spread)?.title, rightOf(flip ? flip.target : spread)?.title]
        .filter(Boolean)
        .join("  ·  ");

  return (
    <div
      role="group"
      aria-roledescription="planner preview"
      aria-label="Flip through planner pages"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go("next");
        if (e.key === "ArrowLeft") go("prev");
      }}
      className="outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div className="relative mx-auto w-full max-w-3xl" style={{ perspective: "2400px" }}>
        {/* page-stack edges under the book */}
        <div
          aria-hidden
          className={`absolute -bottom-1.5 h-3 rounded-b-md bg-sand shadow-sm transition-all duration-500 ${
            closed ? "left-[52%] right-3" : "inset-x-3"
          }`}
        />
        <div
          aria-hidden
          className={`absolute -bottom-3 h-3 rounded-b-md bg-sand-soft shadow-sm transition-all duration-500 ${
            closed ? "left-[54%] right-6" : "inset-x-6"
          }`}
        />
        {/* drop shadow that hugs the closed cover or the open spread */}
        <div
          aria-hidden
          className={`absolute inset-y-0 rounded-md shadow-book transition-all duration-500 ${
            closed ? "left-1/2 right-0" : "inset-x-0"
          }`}
        />

        <div
          className="relative aspect-[1824/1278] w-full rounded-md"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* static halves */}
          <div className="absolute inset-y-0 left-0 w-1/2">
            {closed ? null : (
              <button
                type="button"
                aria-label="Previous pages"
                onClick={() => go("prev")}
                className="block h-full w-full cursor-w-resize"
              >
                <PageFace page={staticLeft} side="left" />
              </button>
            )}
          </div>
          <div className="absolute inset-y-0 right-0 w-1/2">
            <button
              type="button"
              aria-label="Next pages"
              onClick={() => go("next")}
              className="block h-full w-full cursor-e-resize"
            >
              <PageFace page={staticRight} side="right" />
            </button>
          </div>

          {/* turning sheet */}
          {flip && (
            <div
              className="absolute inset-y-0 left-1/2 w-1/2"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                transition: `transform ${FLIP_MS}ms cubic-bezier(0.45, 0.05, 0.25, 1)`,
                transform:
                  flip.dir === "next"
                    ? run
                      ? "rotateY(-180deg)"
                      : "rotateY(0deg)"
                    : run
                      ? "rotateY(0deg)"
                      : "rotateY(-180deg)",
              }}
            >
              <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                <PageFace page={sheetFront} side="right" />
                <div className="pointer-events-none absolute inset-0 rounded-r-md bg-gradient-to-l from-black/0 via-black/0 to-black/10" />
              </div>
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <PageFace page={sheetBack} side="left" />
                <div className="pointer-events-none absolute inset-0 rounded-l-md bg-gradient-to-r from-black/0 to-black/10" />
              </div>
            </div>
          )}

          {/* centre spine line */}
          {!closed && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/20"
            />
          )}
        </div>
      </div>

      <Controls
        label={label}
        position={`${flip ? flip.target + 1 : spread + 1} / ${spreadCount}`}
        onPrev={() => go("prev")}
        onNext={() => go("next")}
        prevDisabled={(flip ? flip.target : spread) <= 0}
        nextDisabled={(flip ? flip.target : spread) >= spreadCount - 1}
      />
    </div>
  );
}

/** Single-page pager (mobile). */
function SinglePager() {
  const [index, setIndex] = useState(0);
  const page = pages[index];

  return (
    <div>
      <div className="relative mx-auto w-full max-w-sm">
        <div aria-hidden className="absolute inset-x-3 -bottom-1.5 h-3 rounded-b-md bg-sand shadow-sm" />
        <div
          key={index}
          className="relative aspect-[912/1278] w-full overflow-hidden rounded-md bg-paper shadow-book ring-1 ring-black/15"
          style={{ animation: "fade-slide 420ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          <Image
            src={page.src}
            alt={`${page.title} — ${page.caption}`}
            fill
            sizes="88vw"
            className="object-cover"
          />
        </div>
        <style>{`@keyframes fade-slide { from { opacity: 0.2; transform: translateX(14px); } to { opacity: 1; transform: none; } }`}</style>
      </div>

      <Controls
        label={page.title}
        position={`${index + 1} / ${pages.length}`}
        onPrev={() => setIndex((i) => Math.max(0, i - 1))}
        onNext={() => setIndex((i) => Math.min(pages.length - 1, i + 1))}
        prevDisabled={index === 0}
        nextDisabled={index === pages.length - 1}
      />
    </div>
  );
}

function Controls(props: {
  label: string;
  position: string;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
}) {
  const btn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-olive/30 text-olive transition-all hover:enabled:border-olive hover:enabled:bg-olive hover:enabled:text-cream disabled:opacity-30";
  return (
    <div className="mt-8 flex items-center justify-center gap-5">
      <button type="button" aria-label="Previous page" onClick={props.onPrev} disabled={props.prevDisabled} className={btn}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div className="min-w-44 text-center sm:min-w-64">
        <p className="text-sm font-bold text-ink">{props.label}</p>
        <p className="mt-0.5 text-xs tracking-[0.2em] text-ink/50">{props.position}</p>
      </div>
      <button type="button" aria-label="Next page" onClick={props.onNext} disabled={props.nextDisabled} className={btn}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

export default function Flipbook() {
  return (
    <section id="preview" className="scroll-mt-20 bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-olive">The preview</p>
          <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">Flip through it.</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            Real pages from the planner — this is exactly what arrives at your door.
            Use the arrows, tap the pages, or your keyboard.
          </p>
        </Reveal>

        <Reveal delay={150} className="mt-14">
          <div className="hidden md:block">
            <SpreadBook />
          </div>
          <div className="md:hidden">
            <SinglePager />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
