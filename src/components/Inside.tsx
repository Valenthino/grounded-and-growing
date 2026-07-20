import Image from "next/image";
import Reveal from "./Reveal";
import { extraFeatures, features } from "@/lib/content";

/** "What's inside" — the real planner pages, presented as a gallery. */
export default function Inside() {
  return (
    <section id="inside" className="scroll-mt-20 bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-olive">What&rsquo;s inside</p>
          <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
            Everything has a place.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            From a year-level vision down to five-minute mornings — {""}
            178 pages of structure that thinks the way your life actually works.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={(i % 3) * 110}
              className="group overflow-hidden rounded-2xl border border-sand bg-white shadow-card transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="relative aspect-[912/1000] overflow-hidden bg-beige">
                <Image
                  src={feature.src}
                  alt={`${feature.title} page of the Grounded & Growing planner`}
                  fill
                  sizes="(min-width: 1024px) 350px, (min-width: 640px) 45vw, 92vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="p-6">
                <p className="text-[0.68rem] font-bold tracking-[0.22em] text-gold uppercase">
                  {feature.tag}
                </p>
                <h3 className="mt-2 font-display text-2xl text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{feature.caption}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* secondary features */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {extraFeatures.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={(i % 4) * 90}
              className="group flex items-center gap-4 rounded-xl border border-sand bg-cream p-4 transition-colors hover:bg-beige"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md border border-sand/80 bg-white">
                <Image
                  src={feature.src}
                  alt={`${feature.title} page`}
                  fill
                  sizes="64px"
                  className="object-cover object-top"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink/65">{feature.caption}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <a
            href="#preview"
            className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.14em] text-olive uppercase underline-offset-8 transition-colors hover:text-olive-deep hover:underline"
          >
            Flip through the real pages
            <span aria-hidden>↓</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
