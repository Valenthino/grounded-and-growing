import Reveal from "./Reveal";
import { rhythms } from "@/lib/content";

/** The planner's method: four small rhythms. */
export default function Rhythms() {
  return (
    <section id="method" className="grain relative scroll-mt-20 overflow-hidden bg-olive-deep text-cream">
      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-gold-soft">The method</p>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl">
            Four small rhythms.
            <br />
            That&rsquo;s the whole system.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-cream/70">
            No 40-step morning routine. Each rhythm takes less time than you think —
            and together they quietly redirect an entire year.
          </p>
        </Reveal>

        <ol className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {rhythms.map((rhythm, i) => (
            <Reveal
              key={rhythm.number}
              as="li"
              delay={i * 120}
              className="relative rounded-2xl border border-cream/15 bg-cream/[0.04] p-7 backdrop-blur-[2px] transition-colors hover:bg-cream/[0.08]"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-display text-5xl text-gold">{rhythm.number}</span>
                <span className="max-w-28 text-right text-[0.65rem] leading-relaxed font-bold tracking-[0.16em] text-gold-soft uppercase">
                  {rhythm.time}
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl">{rhythm.name}</h3>
              <ul className="mt-4 space-y-2.5">
                {rhythm.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm leading-snug text-cream/75">
                    <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-14 text-center">
          <p className="mx-auto max-w-xl font-script text-2xl text-gold-soft sm:text-3xl">
            &ldquo;It isn&rsquo;t about doing more. It&rsquo;s about doing the right things,
            in the right order.&rdquo;
          </p>
        </Reveal>
      </div>
    </section>
  );
}
