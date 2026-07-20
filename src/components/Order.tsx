import Image from "next/image";
import Reveal from "./Reveal";
import { specs } from "@/lib/content";
import { site } from "@/lib/site";

/** The product card — mockup, specs and the Etsy call to action. */
export default function Order() {
  return (
    <section id="order" className="scroll-mt-20 bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="overflow-hidden rounded-3xl border border-sand bg-white shadow-card">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            {/* mockup: cover fanned over two interior pages */}
            <div className="grain relative flex items-center justify-center overflow-hidden bg-beige p-10 sm:p-14">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(500px 380px at 50% 42%, rgba(192,164,104,0.18), transparent 70%)",
                }}
              />
              <div className="relative h-[340px] w-[300px] sm:h-[420px] sm:w-[360px]">
                <div className="absolute top-8 left-0 w-[200px] -rotate-6 overflow-hidden rounded-md border border-sand bg-white shadow-card sm:w-[250px]">
                  <Image
                    src="/planner/week-left.jpg"
                    alt="Weekly spread page"
                    width={912}
                    height={1278}
                    sizes="250px"
                    className="h-auto w-full"
                  />
                </div>
                <div className="absolute top-4 right-0 w-[200px] rotate-3 overflow-hidden rounded-md border border-sand bg-white shadow-card sm:w-[250px]">
                  <Image
                    src="/planner/annual-vision.jpg"
                    alt="Annual vision page"
                    width={912}
                    height={1278}
                    sizes="250px"
                    className="h-auto w-full"
                  />
                </div>
                <div className="absolute bottom-0 left-1/2 w-[190px] -translate-x-1/2 rotate-[-1.5deg] overflow-hidden rounded-md shadow-book ring-1 ring-black/20 sm:w-[235px]">
                  <Image
                    src="/planner/cover.jpg"
                    alt="Grounded & Growing planner cover"
                    width={912}
                    height={1278}
                    sizes="235px"
                    quality={90}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </div>

            {/* details */}
            <div className="p-8 sm:p-12">
              <p className="eyebrow text-gold">Now on Etsy</p>
              <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
                Grounded &amp; Growing
                <span className="mt-1 block text-xl text-ink/60 italic sm:text-2xl">
                  The Life Planner · Undated
                </span>
              </h2>

              <p className="mt-4 font-display text-3xl text-olive">{site.price}</p>

              <ul className="mt-6 space-y-2.5">
                {specs.map((spec) => (
                  <li key={spec} className="flex gap-3 text-[0.95rem] text-ink/80">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-olive" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {spec}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={site.etsyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-olive px-9 py-4 text-sm font-bold tracking-[0.12em] text-cream uppercase shadow-lg shadow-olive/30 transition-all hover:-translate-y-0.5 hover:bg-olive-deep hover:shadow-xl"
                >
                  Order on Etsy
                </a>
                <a
                  href="#digital"
                  className="text-sm font-bold tracking-[0.12em] text-olive uppercase underline-offset-8 hover:underline"
                >
                  Try the digital taste
                </a>
              </div>

              <p className="mt-5 text-sm text-ink/50">
                {site.size} · Secure checkout through Etsy · Formats &amp; shipping on the listing
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
