type BotanicalArtProps = {
  className?: string;
  /** Mirror the branch horizontally. */
  flip?: boolean;
};

/**
 * Hand-drawn botanical line art echoing the gold branches on the planner cover.
 * Inherits its colour from `currentColor`.
 */
export default function BotanicalArt({ className = "", flip = false }: BotanicalArtProps) {
  return (
    <svg
      viewBox="0 0 420 620"
      fill="none"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <defs>
        <g id="gg-leaf">
          <path
            d="M0 0C18 -24 46 -32 70 -26C58 -2 28 10 0 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M6 -2C26 -10 46 -17 64 -23" stroke="currentColor" strokeWidth="1.4" />
        </g>
        <g id="gg-bud">
          <path d="M0 0C-6 -10 -4 -20 2 -26C8 -20 10 -9 4 0Z" stroke="currentColor" strokeWidth="1.8" />
        </g>
      </defs>

      {/* main stem */}
      <path
        d="M26 612C60 470 96 336 178 214C240 122 310 62 396 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* side twig */}
      <path
        d="M120 300C160 282 208 280 250 296"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <use href="#gg-leaf" transform="translate(52 520) rotate(-58) scale(1.05)" />
      <use href="#gg-leaf" transform="translate(84 434) rotate(118) scale(0.9) scale(-1 1)" />
      <use href="#gg-leaf" transform="translate(118 356) rotate(-52) scale(1.15)" />
      <use href="#gg-leaf" transform="translate(168 268) rotate(124) scale(0.95) scale(-1 1)" />
      <use href="#gg-leaf" transform="translate(216 204) rotate(-44) scale(1.1)" />
      <use href="#gg-leaf" transform="translate(268 148) rotate(130) scale(0.85) scale(-1 1)" />
      <use href="#gg-leaf" transform="translate(318 100) rotate(-38) scale(0.95)" />
      <use href="#gg-leaf" transform="translate(362 58) rotate(136) scale(0.7) scale(-1 1)" />

      <use href="#gg-bud" transform="translate(250 296) rotate(40)" />
      <use href="#gg-bud" transform="translate(232 292) rotate(10) scale(0.8)" />

      <circle cx="204" cy="286" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="176" cy="292" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="392" cy="34" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
