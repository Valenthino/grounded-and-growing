"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { monthlyQuotes } from "@/lib/content";

/** The twelve monthly quotes, as a gentle auto-advancing carousel. */
export default function Quotes() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % monthlyQuotes.length), 5000);
    return () => clearInterval(id);
  }, [paused]);

  const current = monthlyQuotes[index];

  return (
    <section
      aria-label="A year of gentle reminders"
      className="border-y border-olive/10 bg-sand-soft"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-24">
        <Reveal>
          <p className="eyebrow text-olive">A year of gentle reminders</p>

          <div className="mt-10 flex min-h-40 flex-col items-center justify-center sm:min-h-36">
            <p
              key={index}
              className="mx-auto max-w-2xl font-display text-2xl leading-snug text-espresso italic sm:text-[2rem]"
              style={{ animation: "quote-in 600ms cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              &ldquo;{current.quote}&rdquo;
            </p>
            <p className="mt-5 text-[0.72rem] font-bold tracking-[0.34em] text-olive/70 uppercase">
              {current.month}
            </p>
          </div>
          <style>{`@keyframes quote-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }`}</style>

          <div className="mt-8 flex items-center justify-center gap-2">
            {monthlyQuotes.map((q, i) => (
              <button
                key={q.month}
                type="button"
                aria-label={`Show ${q.month}'s quote`}
                aria-current={i === index}
                onClick={() => {
                  setIndex(i);
                  setPaused(true);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-olive" : "w-1.5 bg-olive/25 hover:bg-olive/50"
                }`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
