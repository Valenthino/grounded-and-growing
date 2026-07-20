/**
 * Central site configuration.
 * Swap `etsyUrl` for the real listing URL when the Etsy shop goes live,
 * and adjust `price` to the final listing price.
 */
export const site = {
  name: "Grounded & Growing",
  tagline: "Stop drifting. Start building a life on purpose.",
  description:
    "Grounded & Growing is a 178-page undated life planner that turns vague hopes into visible progress — annual vision, 8 life areas, monthly resets, self-care check-ins and time-blocked weeks. Five quiet minutes at a time.",
  url: "https://grounded-and-growing.vercel.app",
  etsyUrl: "https://www.etsy.com/shop/GroundedAndGrowing", // TODO: replace with the live listing URL
  price: "$34.00", // TODO: set the final Etsy price
  pages: 178,
  size: "6.1″ × 8.5″",
} as const;
