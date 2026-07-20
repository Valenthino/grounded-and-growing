import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-espresso-deep text-champagne/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-12 sm:flex-row sm:justify-between sm:px-8">
        <p className="font-display text-lg tracking-[0.08em] text-champagne">
          Grounded <span className="font-script text-gold-soft italic">&</span> Growing
        </p>

        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-7 gap-y-2">
          {[
            ["#inside", "Inside"],
            ["#method", "The Method"],
            ["#preview", "Preview"],
            ["#digital", "Digital Taste"],
            ["#order", "Order"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-[0.72rem] font-bold tracking-[0.16em] uppercase transition-colors hover:text-champagne"
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href={site.etsyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.72rem] font-bold tracking-[0.16em] uppercase transition-colors hover:text-champagne"
        >
          Etsy Shop ↗
        </a>
      </div>
      <div className="border-t border-champagne/10 py-5 text-center text-xs tracking-wide text-champagne/40">
        Designed with intention · © {new Date().getFullYear()} {site.name}
      </div>
    </footer>
  );
}
