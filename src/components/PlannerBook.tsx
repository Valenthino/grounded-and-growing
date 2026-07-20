"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type PlannerBookProps = {
  className?: string;
  priority?: boolean;
};

/** A CSS-3D mockup of the printed planner, tilting gently toward the cursor. */
export default function PlannerBook({ className = "", priority = false }: PlannerBookProps) {
  const frame = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 10, y: py * -8 });
  };

  return (
    <div
      ref={frame}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className={`relative ${className}`}
      style={{ perspective: "1600px" }}
    >
      <div className="animate-float">
        <div
          className="relative mx-auto w-[240px] sm:w-[290px] lg:w-[320px] transition-transform duration-300 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${-24 + tilt.x}deg) rotateX(${7 + tilt.y}deg)`,
          }}
        >
          {/* back cover */}
          <div
            className="absolute inset-0 rounded-r-lg rounded-l-sm bg-espresso-deep"
            style={{ transform: "translateZ(-17px)" }}
          />
          {/* page block (right edge) */}
          <div
            className="absolute top-[3px] bottom-[3px] right-0 w-[34px] origin-right"
            style={{
              transform: "rotateY(90deg) translateX(17px)",
              background:
                "repeating-linear-gradient(to right, #f7f2e4 0px, #f7f2e4 2px, #ddd5bf 2px, #ddd5bf 3px)",
            }}
          />
          {/* page block (bottom edge) */}
          <div
            className="absolute inset-x-[2px] bottom-0 h-[34px] origin-bottom"
            style={{
              transform: "rotateX(-90deg) translateY(17px)",
              background:
                "repeating-linear-gradient(to bottom, #f3edde 0px, #f3edde 2px, #d8d0ba 2px, #d8d0ba 3px)",
            }}
          />
          {/* spine */}
          <div
            className="absolute top-0 bottom-0 left-0 w-[34px] origin-left rounded-sm bg-espresso"
            style={{ transform: "rotateY(-90deg) translateX(-17px)" }}
          />
          {/* front cover */}
          <div
            className="relative aspect-[912/1278] overflow-hidden rounded-r-lg rounded-l-sm shadow-book ring-1 ring-black/30"
            style={{ transform: "translateZ(17px)" }}
          >
            <Image
              src="/planner/cover.jpg"
              alt="Grounded & Growing planner cover — deep olive with gold botanical line art"
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 290px, 240px"
              quality={90}
              priority={priority}
              className="object-cover"
            />
            {/* spine crease + gloss */}
            <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-white/[0.14]" />
          </div>
        </div>
      </div>

      {/* floor shadow */}
      <div
        aria-hidden
        className="animate-float-shadow absolute -bottom-10 left-1/2 h-10 w-[75%] -translate-x-1/2 rounded-[50%] bg-black/45 blur-2xl"
      />
    </div>
  );
}
