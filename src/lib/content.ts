/** Copy and imagery pulled directly from the printed planner. */

export type PlannerPage = {
  src: string;
  title: string;
  caption: string;
};

/** Pages shown in the flipbook, in reading order. */
export const flipbookPages: PlannerPage[] = [
  { src: "/planner/cover.jpg", title: "Cover", caption: "Grounded & Growing — The Life Planner" },
  { src: "/planner/letter.jpg", title: "A Letter to You", caption: "Where every planner should begin" },
  { src: "/planner/how-to.jpg", title: "How to Use This Planner", caption: "Three simple rhythms" },
  { src: "/planner/life-snapshot.jpg", title: "My Life Snapshot", caption: "Your command centre" },
  { src: "/planner/annual-vision.jpg", title: "Annual Vision", caption: "This year, I want to…" },
  { src: "/planner/life-areas.jpg", title: "Goals — 8 Life Areas", caption: "Annual goal setting" },
  { src: "/planner/vision-board.jpg", title: "My Vision Board", caption: "The life you are building" },
  { src: "/planner/quarterly.jpg", title: "Quarterly Breakdown", caption: "90-day goal sprints" },
  { src: "/planner/year-glance.jpg", title: "Year at a Glance", caption: "Annual calendar" },
  { src: "/planner/annual-habits.jpg", title: "Annual Habit Tracker", caption: "Five habits, twelve months" },
  { src: "/planner/affirmations.jpg", title: "Affirmations for the Unstuck", caption: "The words you repeat become the life you create" },
  { src: "/planner/month-overview.jpg", title: "Monthly Overview", caption: "One main focus, every month" },
  { src: "/planner/month-calendar.jpg", title: "Monthly Calendar", caption: "With a quote to set the tone" },
  { src: "/planner/week-left.jpg", title: "Weekly Spread", caption: "Time-blocked days, top 3, morning mood" },
  { src: "/planner/week-right.jpg", title: "Weekly Spread", caption: "Habits and end-of-week reflection" },
  { src: "/planner/self-care.jpg", title: "Self-Care Check-In", caption: "How much you filled back up" },
  { src: "/planner/review-preview.jpg", title: "Review & Preview", caption: "Look back with gratitude, ahead with purpose" },
  { src: "/planner/brain-dump.jpg", title: "Brain Dump", caption: "Room for everything else" },
];

export type Feature = PlannerPage & { tag: string };

/** The six hero features of the "What's inside" gallery. */
export const features: Feature[] = [
  {
    src: "/planner/annual-vision.jpg",
    title: "Annual Vision",
    tag: "Once a year",
    caption:
      "Your word of the year, three core values, what you are releasing — and who you are becoming.",
  },
  {
    src: "/planner/life-areas.jpg",
    title: "8 Life Areas",
    tag: "The diagnosis",
    caption:
      "Career, health, finances, relationships, growth, fun, home, meaning. A stuck life usually has 1–2 areas dragging the rest down. Start there.",
  },
  {
    src: "/planner/quarterly.jpg",
    title: "90-Day Sprints",
    tag: "Quarterly",
    caption:
      "Big goals broken into four focused quarters — one top goal and its key actions at a time.",
  },
  {
    src: "/planner/month-overview.jpg",
    title: "Monthly Reset",
    tag: "12 sections",
    caption:
      "One main focus, what you are protecting, what you are saying no to — and one thing just for you.",
  },
  {
    src: "/planner/week-left.jpg",
    title: "Weekly Spreads",
    tag: "60 undated weeks",
    caption:
      "Time-blocked days from 6am to 9pm, this week's top 3, morning mood and a habit tracker.",
  },
  {
    src: "/planner/self-care.jpg",
    title: "Self-Care Check-In",
    tag: "Monthly",
    caption:
      "Sleep, movement, mental load, connection, joy, progress — not how much you did, but how much you filled back up.",
  },
];

export const extraFeatures: Feature[] = [
  {
    src: "/planner/vision-board.jpg",
    title: "Vision Board",
    tag: "Dream in pictures",
    caption: "Paste images, words and symbols of the life you are building.",
  },
  {
    src: "/planner/annual-habits.jpg",
    title: "Annual Habit Tracker",
    tag: "5 habits × 12 months",
    caption: "Watch consistency compound across the whole year.",
  },
  {
    src: "/planner/affirmations.jpg",
    title: "Affirmations",
    tag: "For the unstuck",
    caption: "Twelve written for you, plus room for your own.",
  },
  {
    src: "/planner/brain-dump.jpg",
    title: "Notes & Brain Dump",
    tag: "Every month",
    caption: "A place for everything that doesn't have a place yet.",
  },
];

/** Affirmations printed in the planner — used for the marquee and the demo app. */
export const affirmations = [
  "I am allowed to want more for my life.",
  "I am building something real, one day at a time.",
  "Small progress is still progress.",
  "Resting is part of the work.",
  "Every day I choose to be grounded and growing.",
  "Saying no to one thing is saying yes to another.",
  "Clarity comes from action, not waiting.",
  "My past does not determine my next chapter.",
  "I deserve the life I am working toward.",
  "I choose intention over autopilot.",
  "I am not behind. I am building.",
  "I give myself the grace to begin again.",
];

/** The quote that opens each monthly calendar. */
export const monthlyQuotes: { month: string; quote: string }[] = [
  { month: "January", quote: "Start where you are. Grow with intention. Trust the process." },
  { month: "February", quote: "Growth isn't rushed. The strongest roots grow quietly beneath the surface." },
  { month: "March", quote: "Small, consistent steps will always carry you further than perfect intentions." },
  { month: "April", quote: "Make room for new beginnings by letting go of what no longer serves you." },
  { month: "May", quote: "Bloom where your effort, not your comfort, is planted." },
  { month: "June", quote: "Halfway isn't the finish — it's a chance to realign with what matters most." },
  { month: "July", quote: "Rest is not falling behind. It is part of moving forward." },
  { month: "August", quote: "The life you want is built through the choices you repeat every day." },
  { month: "September", quote: "Refocus on what matters, and let everything else become background noise." },
  { month: "October", quote: "You don't have to do everything — only the things that move you closer to your purpose." },
  { month: "November", quote: "Celebrate how far you've come, even if you're not yet where you want to be." },
  { month: "December", quote: "Every ending holds proof of your growth and space for a new beginning." },
];

export const rhythms = [
  {
    number: "01",
    name: "Getting started",
    time: "20 minutes, once",
    points: [
      "Complete your Annual Vision pages",
      "Create your Vision Board",
      "Set your 8 Life Area goals",
      "Break them into 90-day sprints",
    ],
  },
  {
    number: "02",
    name: "Monthly reset",
    time: "15 minutes",
    points: [
      "Write your Monthly Intention — one focus only",
      "Fill the monthly calendar",
      "Complete your Self-Care Check-In",
      "Review, then preview the month ahead",
    ],
  },
  {
    number: "03",
    name: "Weekly setup",
    time: "10 minutes, Sunday evening",
    points: [
      "Set your week's #1 focus",
      "Time-block your top 3 priorities",
      "Fill the weekly habit tracker",
      "Revisit your Vision Board",
    ],
  },
  {
    number: "04",
    name: "Daily grounding",
    time: "5 minutes, each morning",
    points: [
      "Set today's intention",
      "Choose your top 3 — in order",
      "Note your morning mood",
      "Then go build your day",
    ],
  },
];

export const faq = [
  {
    q: "Is it dated? What if I start in the middle of the year?",
    a: "It's fully undated — you write in your own dates, so you can start any day of any month. No wasted pages, and no guilt if life makes you pause for a few weeks. You just begin again.",
  },
  {
    q: "How much time does it actually take?",
    a: "Less than you think. About twenty minutes once to set your annual vision, fifteen minutes for the monthly reset, ten minutes on Sunday evenings, and five quiet minutes each morning. The planner is built around small rhythms, not marathon journaling sessions.",
  },
  {
    q: "What's inside the 178 pages?",
    a: "An annual vision section (word of the year, values, 8 life area goals, vision board, 90-day sprints), a year-at-a-glance calendar, an annual habit tracker, affirmations — then twelve monthly sections, each with an overview, calendar, self-care check-in, five time-blocked weekly spreads, a review & preview, notes and a brain dump.",
  },
  {
    q: "What makes it different from other planners?",
    a: "Most planners help you do more. This one helps you do the right things, in the right order, with enough self-awareness to know the difference. It pairs goal structure with monthly self-care check-ins — because a life that's only optimised eventually burns down. Grounded and growing.",
  },
  {
    q: "Who is it for?",
    a: "The one who feels stuck — not failing, just drifting. If your days are full but your goals have gone quiet, this planner was designed page by page for you.",
  },
  {
    q: "How do I order?",
    a: "Through our Etsy shop — tap any \"Order on Etsy\" button on this page. Etsy handles secure checkout, and you'll find current formats, options and shipping details on the listing.",
  },
];

export const specs = [
  "178 thoughtfully designed pages",
  "Undated — start any day, pause without guilt",
  "Annual vision, word of the year & 8 life area goals",
  "90-day goal sprints + year at a glance",
  "12 monthly resets with self-care check-ins",
  "60 time-blocked weekly spreads with habit tracking",
  "Affirmations, notes & brain-dump pages",
];

export const moods = ["😄", "🙂", "😐", "😕", "😞"] as const;

export const demoHabits = [
  "Move my body",
  "Read 10 pages",
  "Drink water",
  "Phone-free hour",
  "Gratitude note",
];

export const checkinAreas = [
  { key: "sleep", label: "Sleep", question: "How well did you sleep?" },
  { key: "movement", label: "Movement", question: "Did your body feel cared for?" },
  { key: "mental", label: "Mental load", question: "How light did your mind feel?" },
  { key: "connection", label: "Connection", question: "Time with people who energise you?" },
  { key: "joy", label: "Joy", question: "Did you do things that felt light?" },
  { key: "progress", label: "Progress", question: "Did you feel unstuck and moving forward?" },
] as const;
