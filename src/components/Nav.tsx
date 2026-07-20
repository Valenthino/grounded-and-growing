"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const links = [
  { href: "#inside", label: "Inside" },
  { href: "#method", label: "The Method" },
  { href: "#preview", label: "Preview" },
  { href: "#digital", label: "Digital Taste" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-espresso-deep/90 shadow-lg shadow-black/20 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="#top"
          className="font-display text-lg tracking-[0.08em] text-champagne"
          onClick={() => setOpen(false)}
        >
          Grounded <span className="font-script text-gold-soft italic">&</span> Growing
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.8rem] font-bold tracking-[0.14em] text-champagne/75 uppercase transition-colors hover:text-champagne"
            >
              {link.label}
            </a>
          ))}
          <a
            href={site.etsyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gold px-5 py-2 text-[0.8rem] font-bold tracking-[0.1em] text-espresso-deep uppercase transition-all hover:bg-gold-soft hover:shadow-md"
          >
            Order on Etsy
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-champagne transition-transform ${open ? "translate-y-1 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-champagne transition-transform ${open ? "-translate-y-1 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {open && (
        <div className="border-t border-champagne/10 bg-espresso-deep/95 px-5 pt-2 pb-6 backdrop-blur-md md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-bold tracking-[0.14em] text-champagne/85 uppercase"
            >
              {link.label}
            </a>
          ))}
          <a
            href={site.etsyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-full bg-gold px-6 py-2.5 text-sm font-bold tracking-[0.1em] text-espresso-deep uppercase"
          >
            Order on Etsy
          </a>
        </div>
      )}
    </header>
  );
}
