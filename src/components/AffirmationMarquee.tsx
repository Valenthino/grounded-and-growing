import { affirmations } from "@/lib/content";

/** Endless ticker of the planner's affirmations. */
export default function AffirmationMarquee() {
  const track = [...affirmations, ...affirmations];
  return (
    <section
      aria-label="Affirmations from the planner"
      className="overflow-hidden border-y border-olive/15 bg-sand py-4"
    >
      <div className="animate-marquee flex w-max items-center hover:[animation-play-state:paused]">
        {track.map((text, i) => (
          <span
            key={i}
            aria-hidden={i >= affirmations.length}
            className="flex items-center whitespace-nowrap"
          >
            <span className="px-6 font-display text-lg text-espresso italic sm:text-xl">
              {text}
            </span>
            <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 text-olive/60" fill="currentColor" aria-hidden>
              <path d="M12 2c1 4.5 3.5 8.5 10 10-6.5 1.5-9 5.5-10 10-1-4.5-3.5-8.5-10-10 6.5-1.5 9-5.5 10-10z" />
            </svg>
          </span>
        ))}
      </div>
    </section>
  );
}
