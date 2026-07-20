"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Reveal from "./Reveal";
import { affirmations, checkinAreas, demoHabits, moods } from "@/lib/content";

const STORAGE_KEY = "gg-demo-v1";
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

type Top3Item = { text: string; done: boolean };

type DemoState = {
  intention: string;
  top3: Top3Item[];
  mood: number | null;
  affIndex: number;
  habits: boolean[][];
  checkin: number[];
  needMore: string;
};

const initialState: DemoState = {
  intention: "",
  top3: [
    { text: "", done: false },
    { text: "", done: false },
    { text: "", done: false },
  ],
  mood: null,
  affIndex: 0,
  habits: demoHabits.map(() => DAYS.map(() => false)),
  checkin: checkinAreas.map(() => 5),
  needMore: "",
};

const top3Labels = ["Most important", "Important", "If time allows"];

/** True only after hydration — lets us render browser-dependent state safely. */
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function loadDemoState(): DemoState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState, ...(JSON.parse(raw) as Partial<DemoState>) };
  } catch {
    /* private mode etc. — the demo still works in memory */
  }
  // first visit: rotate the affirmation with the calendar day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return { ...initialState, affIndex: dayOfYear % affirmations.length };
}

function useDemoState() {
  const [state, setState] = useState<DemoState>(loadDemoState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  return [state, setState] as const;
}

const label = "text-[0.6rem] font-bold tracking-[0.22em] text-olive uppercase";

function TodayTab({
  state,
  setState,
}: {
  state: DemoState;
  setState: React.Dispatch<React.SetStateAction<DemoState>>;
}) {
  // TodayTab only renders after hydration, so Date usage is safe here
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";

  return (
    <div className="space-y-5">
      <div>
        <p className="font-display text-2xl text-ink">{greeting}</p>
        <p className="mt-0.5 text-xs text-ink/55">{today}</p>
      </div>

      <div className="rounded-xl bg-sand-soft p-4">
        <div className="flex items-center justify-between">
          <p className={label}>Today&rsquo;s affirmation</p>
          <button
            type="button"
            aria-label="Next affirmation"
            onClick={() =>
              setState((s) => ({ ...s, affIndex: (s.affIndex + 1) % affirmations.length }))
            }
            className="text-olive/70 transition-colors hover:text-olive"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
            </svg>
          </button>
        </div>
        <p className="mt-2 font-script text-xl leading-snug text-espresso">
          {affirmations[state.affIndex]}
        </p>
      </div>

      <div>
        <p className={label}>My intention today</p>
        <input
          type="text"
          value={state.intention}
          onChange={(e) => setState((s) => ({ ...s, intention: e.target.value }))}
          placeholder="Today, I choose to…"
          className="mt-1.5 w-full border-b border-sand bg-transparent pb-1.5 text-sm text-ink placeholder:text-ink/35 focus:border-olive focus:outline-none"
        />
      </div>

      <div>
        <p className={label}>This day&rsquo;s top 3</p>
        <ul className="mt-2 space-y-2.5">
          {state.top3.map((item, i) => (
            <li key={i} className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label={`Mark "${item.text || top3Labels[i]}" ${item.done ? "not done" : "done"}`}
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    top3: s.top3.map((t, j) => (j === i ? { ...t, done: !t.done } : t)),
                  }))
                }
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  item.done ? "border-olive bg-olive text-cream" : "border-ink/30 text-transparent"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[0.58rem] tracking-[0.14em] text-ink/45 uppercase">
                  {i + 1}. {top3Labels[i]}
                </p>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      top3: s.top3.map((t, j) => (j === i ? { ...t, text: e.target.value } : t)),
                    }))
                  }
                  placeholder="Add it here"
                  className={`w-full border-b border-sand bg-transparent pb-0.5 text-sm placeholder:text-ink/30 focus:border-olive focus:outline-none ${
                    item.done ? "text-ink/40 line-through" : "text-ink"
                  }`}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className={label}>Morning mood</p>
        <div className="mt-2 flex gap-2">
          {moods.map((emoji, i) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Mood ${i + 1} of ${moods.length}`}
              aria-pressed={state.mood === i}
              onClick={() => setState((s) => ({ ...s, mood: s.mood === i ? null : i }))}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all ${
                state.mood === i
                  ? "bg-olive/15 ring-2 ring-olive"
                  : "bg-beige hover:bg-sand-soft"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HabitsTab({
  state,
  setState,
}: {
  state: DemoState;
  setState: React.Dispatch<React.SetStateAction<DemoState>>;
}) {
  const done = state.habits.flat().filter(Boolean).length;
  const total = demoHabits.length * DAYS.length;
  const pct = Math.round((done / total) * 100);
  const message =
    pct === 0
      ? "Tap a circle to begin."
      : pct < 30
        ? "Small progress is still progress."
        : pct < 70
          ? "You're building something real."
          : "Grounded and growing — look at you.";

  return (
    <div className="space-y-5">
      <div>
        <p className="font-display text-2xl text-ink">This week&rsquo;s habits</p>
        <p className="mt-0.5 text-xs text-ink/55">Consistency over intensity.</p>
      </div>

      <div className="space-y-3.5">
        <div className="grid grid-cols-[1fr_repeat(7,1.3rem)] items-center gap-x-0.5">
          <span />
          {DAYS.map((d, i) => (
            <span key={i} className="text-center text-[0.58rem] font-bold text-ink/40">
              {d}
            </span>
          ))}
        </div>
        {demoHabits.map((habit, hi) => (
          <div key={habit} className="grid grid-cols-[1fr_repeat(7,1.3rem)] items-center gap-x-0.5">
            <span className="truncate pr-1 text-[0.7rem] text-ink/80">{habit}</span>
            {DAYS.map((_, di) => (
              <button
                key={di}
                type="button"
                aria-label={`${habit}, day ${di + 1}: ${state.habits[hi][di] ? "done" : "not done"}`}
                aria-pressed={state.habits[hi][di]}
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    habits: s.habits.map((row, r) =>
                      r === hi ? row.map((v, c) => (c === di ? !v : v)) : row,
                    ),
                  }))
                }
                className={`mx-auto h-4 w-4 rounded-full border transition-all ${
                  state.habits[hi][di]
                    ? "border-olive bg-olive"
                    : "border-ink/25 bg-transparent hover:border-olive/60"
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <p className={label}>This week</p>
          <p className="text-xs font-bold text-olive">
            {done}/{total}
          </p>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-beige">
          <div
            className="h-full rounded-full bg-olive transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2.5 font-script text-lg text-olive">{message}</p>
      </div>
    </div>
  );
}

function CheckinTab({
  state,
  setState,
}: {
  state: DemoState;
  setState: React.Dispatch<React.SetStateAction<DemoState>>;
}) {
  const avg = state.checkin.reduce((a, b) => a + b, 0) / state.checkin.length;
  const message =
    avg < 4
      ? "Running low. Be gentle with yourself this week."
      : avg < 7
        ? "You're refilling. Protect what's working."
        : "You're pouring from a full cup. Keep it that way.";
  const ring = 2 * Math.PI * 26;

  return (
    <div className="space-y-5">
      <div>
        <p className="font-display text-2xl text-ink">Self-care check-in</p>
        <p className="mt-0.5 text-xs text-ink/55">How much did you fill back up?</p>
      </div>

      <div className="space-y-3.5">
        {checkinAreas.map((area, i) => (
          <div key={area.key}>
            <div className="flex items-baseline justify-between">
              <label htmlFor={`checkin-${area.key}`} className="text-xs font-bold text-ink/80">
                {area.label}
              </label>
              <span className="text-xs font-bold text-olive">{state.checkin[i]}</span>
            </div>
            <input
              id={`checkin-${area.key}`}
              type="range"
              min={1}
              max={10}
              value={state.checkin[i]}
              aria-label={area.question}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  checkin: s.checkin.map((v, j) => (j === i ? Number(e.target.value) : v)),
                }))
              }
              className="slider-olive mt-1 w-full"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-sand-soft p-4">
        <svg viewBox="0 0 60 60" className="h-14 w-14 shrink-0 -rotate-90">
          <circle cx="30" cy="30" r="26" fill="none" stroke="var(--color-beige)" strokeWidth="5" />
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke="var(--color-olive)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={ring}
            strokeDashoffset={ring * (1 - avg / 10)}
            style={{ transition: "stroke-dashoffset 400ms ease" }}
          />
        </svg>
        <div>
          <p className="font-display text-xl text-ink">{avg.toFixed(1)} / 10</p>
          <p className="mt-0.5 text-xs leading-snug text-ink/65">{message}</p>
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { id: "today", name: "Today" },
  { id: "habits", name: "Habits" },
  { id: "checkin", name: "Check-in" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function TabIcon({ id, className }: { id: TabId; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  } as const;
  if (id === "today")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2" />
      </svg>
    );
  if (id === "habits")
    return (
      <svg {...common}>
        <path d="M17 2l4 4-4 4" />
        <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
        <path d="M7 22l-4-4 4-4" />
        <path d="M21 13v1a4 4 0 0 1-4 4H3" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M19 14c1.5-1.4 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3.4.9-4.5 2.3A5.6 5.6 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.1 3 5.5l7 6.5z" />
    </svg>
  );
}

function PhoneDemo() {
  // localStorage state can differ from the server render, so the demo body
  // mounts only after hydration
  const mounted = useMounted();
  const [state, setState] = useDemoState();
  const [tab, setTab] = useState<TabId>("today");

  const reset = () => {
    setState({ ...initialState, affIndex: state.affIndex });
    setTab("today");
  };

  const body = useMemo(() => {
    if (!mounted) return null;
    if (tab === "habits") return <HabitsTab state={state} setState={setState} />;
    if (tab === "checkin") return <CheckinTab state={state} setState={setState} />;
    return <TodayTab state={state} setState={setState} />;
  }, [mounted, tab, state, setState]);

  return (
    <div className="relative mx-auto w-[320px]">
      {/* glow */}
      <div aria-hidden className="absolute -inset-8 rounded-[4rem] bg-gold/10 blur-2xl" />

      <div className="relative rounded-[2.8rem] border-[10px] border-black/90 bg-paper shadow-book">
        {/* notch */}
        <div aria-hidden className="absolute top-2 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-black/90" />

        <div className="flex h-[600px] flex-col overflow-hidden rounded-[2.1rem]">
          {/* app header */}
          <div className="flex items-center justify-between px-5 pt-10 pb-3">
            <p className="font-display text-sm tracking-[0.06em] text-espresso">
              Grounded <span className="font-script text-gold italic">&</span> Growing
            </p>
            <button
              type="button"
              onClick={reset}
              className="text-[0.6rem] font-bold tracking-[0.16em] text-ink/40 uppercase transition-colors hover:text-olive"
            >
              Reset
            </button>
          </div>

          {/* body */}
          <div className="flex-1 overflow-y-auto px-5 pb-4">{body}</div>

          {/* tab bar */}
          <div className="grid grid-cols-3 border-t border-sand bg-cream/90 px-2 py-2.5 backdrop-blur">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-lg py-1 text-[0.6rem] font-bold tracking-[0.12em] uppercase transition-colors ${
                  tab === t.id ? "text-olive" : "text-ink/40 hover:text-ink/70"
                }`}
              >
                <TabIcon id={t.id} className="h-5 w-5" />
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The "digital taste" — a working slice of the planner's method. */
export default function AppPreview() {
  return (
    <section id="digital" className="grain relative scroll-mt-20 overflow-hidden bg-espresso text-champagne">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(800px 500px at 80% 20%, rgba(192,164,104,0.12), transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow text-gold-soft">The digital taste</p>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl">
            Feel it working —
            <br />
            right now.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-champagne/70">
            The planner is paper on purpose. But here&rsquo;s a small interactive
            taste of the method. Set an intention. Pick today&rsquo;s top three.
            Check in with yourself. Ninety seconds — notice the shift.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              ["Set an intention", "one sentence that frames the whole day."],
              ["Choose a top 3", "because order beats overwhelm, every time."],
              ["Check in with yourself", "awareness first, optimisation second."],
            ].map(([title, rest]) => (
              <li key={title} className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <p className="text-champagne/80">
                  <span className="font-bold text-champagne">{title}</span> — {rest}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-md text-sm text-champagne/50">
            Everything you type stays in your browser. The printed planner is where
            the real magic happens — this is just a taste.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <PhoneDemo />
        </Reveal>
      </div>
    </section>
  );
}
