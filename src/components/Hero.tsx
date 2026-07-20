import BotanicalArt from "./BotanicalArt";
import PlannerBook from "./PlannerBook";
import { site } from "@/lib/site";

const stats = [
  `${site.pages} pages`,
  "Undated — start any day",
  "8 life areas",
  "60 weekly spreads",
];

export default function Hero() {
  return (
    <section
      id="top"
      className="grain relative overflow-hidden bg-espresso text-champagne"
    >
      {/* ambient light + botanicals */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 600px at 72% 38%, rgba(192,164,104,0.16), transparent 60%), radial-gradient(700px 500px at 8% 90%, rgba(91,87,52,0.35), transparent 65%)",
        }}
      />
      <BotanicalArt className="absolute -top-24 -left-16 w-72 text-gold-soft/25 sm:w-96" flip />
      <BotanicalArt className="absolute -right-20 -bottom-28 w-72 rotate-180 text-gold-soft/20 sm:w-96" />

      <div className="relative mx-auto grid max-w-6xl gap-16 px-5 pt-32 pb-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:pt-40 lg:pb-32">
        <div className="text-center lg:text-left">
          <p className="eyebrow text-gold-soft">The Life Planner · Undated</p>

          <h1 className="mt-6 font-display leading-[0.95] tracking-[0.06em] text-champagne">
            <span className="block text-5xl sm:text-6xl lg:text-7xl">GROUNDED</span>
            <span className="my-1 block font-script text-4xl text-gold italic sm:text-5xl lg:my-2">
              &amp;
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl">GROWING</span>
          </h1>

          <p className="mx-auto mt-7 max-w-md text-lg font-bold tracking-wide text-champagne/95 lg:mx-0">
            {site.tagline}
          </p>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-champagne/70 lg:mx-0">
            A {site.pages}-page undated life planner that turns vague hopes into
            visible progress — five quiet minutes at a time.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <a
              href={site.etsyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-8 py-3.5 text-sm font-bold tracking-[0.12em] text-espresso-deep uppercase shadow-lg shadow-black/25 transition-all hover:-translate-y-0.5 hover:bg-gold-soft hover:shadow-xl"
            >
              Order on Etsy
            </a>
            <a
              href="#preview"
              className="rounded-full border border-champagne/40 px-8 py-3.5 text-sm font-bold tracking-[0.12em] text-champagne uppercase transition-all hover:border-champagne hover:bg-champagne/10"
            >
              Flip through it
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
            {stats.map((stat) => (
              <li
                key={stat}
                className="flex items-center gap-2 text-[0.8rem] font-bold tracking-[0.08em] text-champagne/60 uppercase"
              >
                <span aria-hidden className="h-1 w-1 rounded-full bg-gold" />
                {stat}
              </li>
            ))}
          </ul>
        </div>

        <PlannerBook priority className="mt-4 lg:mt-0" />
      </div>
    </section>
  );
}
