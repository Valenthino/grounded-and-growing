"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import { faq } from "@/lib/content";

/** Frequently asked questions, one open at a time. */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="text-center">
          <p className="eyebrow text-olive">Questions</p>
          <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
            Everything else you&rsquo;re wondering.
          </h2>
        </Reveal>

        <div className="mt-12 divide-y divide-sand border-y border-sand">
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 60}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-olive"
                  >
                    <span className="text-[1.05rem] font-bold text-ink">{item.q}</span>
                    <span
                      aria-hidden
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-olive/30 text-olive transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 leading-relaxed text-ink/70">{item.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
