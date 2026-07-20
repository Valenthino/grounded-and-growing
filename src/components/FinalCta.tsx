import BotanicalArt from "./BotanicalArt";
import Reveal from "./Reveal";
import { site } from "@/lib/site";

/** Closing call to action, echoing the letter's wave. */
export default function FinalCta() {
  return (
    <section className="grain relative overflow-hidden bg-olive text-cream">
      <BotanicalArt className="absolute -top-16 -right-12 w-64 rotate-180 text-gold-soft/20 sm:w-80" />
      <BotanicalArt className="absolute -bottom-20 -left-14 w-64 text-gold-soft/15 sm:w-80" flip />

      <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <Reveal>
          <p className="font-script text-3xl text-gold-soft sm:text-4xl">You are not behind.</p>
          <h2 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
            You are building something
            <br />
            that lasts.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream/75">
            Undated, so the best day to start is the one you&rsquo;re in.
            Open it tomorrow morning — five minutes — and notice how the day lands.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={site.etsyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-10 py-4 text-sm font-bold tracking-[0.12em] text-espresso-deep uppercase shadow-lg shadow-black/25 transition-all hover:-translate-y-0.5 hover:bg-gold-soft hover:shadow-xl"
            >
              Order on Etsy
            </a>
            <a
              href="#preview"
              className="rounded-full border border-cream/40 px-10 py-4 text-sm font-bold tracking-[0.12em] text-cream uppercase transition-all hover:border-cream hover:bg-cream/10"
            >
              See inside first
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
