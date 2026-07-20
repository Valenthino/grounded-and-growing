import Reveal from "./Reveal";

/** Excerpt of the planner's opening letter, set like the printed page. */
export default function Letter() {
  return (
    <section className="relative bg-cream">
      <div className="mx-auto max-w-2xl px-5 pt-20 pb-44 text-center sm:px-8 sm:pt-28 sm:pb-52">
        <Reveal>
          <h2 className="text-2xl tracking-[0.04em] text-ink sm:text-3xl">
            <span className="font-bold">A LETTER</span>{" "}
            <span className="font-light">TO YOU</span>
          </h2>
          <p className="mt-1 font-script text-4xl text-olive sm:text-5xl">welcome</p>
        </Reveal>

        <Reveal delay={120} className="mt-10 space-y-5 text-left text-[1.02rem] leading-relaxed text-ink/85">
          <p>You picked this up because something isn&rsquo;t working.</p>
          <p>
            Not because you&rsquo;re failing — you&rsquo;re not. But because somewhere between
            who you were and who you want to be, you lost the thread. Life started
            happening <em>to</em> you instead of being built <em>by</em> you. The days got
            full and the goals got quiet.
          </p>
          <p>This planner is how you find the thread again.</p>
          <p>
            It isn&rsquo;t about doing more. It&rsquo;s about doing the right things, in the
            right order, with enough self-awareness to know the difference. It&rsquo;s about
            five minutes each morning that changes how the whole day lands.
          </p>
          <p>
            You don&rsquo;t have to have it all figured out. You just have to open it.
          </p>
        </Reveal>

        <Reveal delay={200} className="mt-10 text-left">
          <p className="text-sm font-bold tracking-[0.1em] text-ink uppercase">
            That person is you.
          </p>
          <p className="mt-1 text-sm text-ink/70 italic">
            With intention,
            <br />
            The Grounded &amp; Growing Team
          </p>
        </Reveal>
      </div>

      {/* olive wave footer, straight from the printed page */}
      <div className="absolute inset-x-0 bottom-0">
        <svg viewBox="0 0 1440 150" preserveAspectRatio="none" className="block h-[150px] w-full" aria-hidden>
          <path
            d="M0,150 L0,110 C240,30 420,22 720,52 C1020,82 1240,70 1440,34 L1440,150 Z"
            fill="var(--color-olive)"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 pb-7 text-center">
          <svg viewBox="0 0 24 24" className="mx-auto mb-2 h-5 w-5 text-gold-soft" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
            <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.5 1 2.5h6c0-1 .4-1.9 1-2.5A6 6 0 0 0 12 3z" />
          </svg>
          <p className="px-6 font-script text-xl text-champagne sm:text-2xl">
            You are not behind. You are building something that lasts.
          </p>
        </div>
      </div>
    </section>
  );
}
