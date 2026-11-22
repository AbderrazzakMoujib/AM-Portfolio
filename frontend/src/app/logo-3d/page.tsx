
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { RotationMode } from "@/components/home/AMLogo3D";

const AMLogo3D = dynamic(
  () => import("@/components/home/AMLogo3D"),
  { ssr: false }
);

const modes: { label: string; value: RotationMode }[] = [
  { label: "Horizontal 360°", value: "horizontal" },
  { label: "Vertical 360°", value: "vertical" },
  { label: "X + Y 360°", value: "both" },
  { label: "Pause", value: "paused" },
];

export default function Logo3DPage() {
  const [mode, setMode] = useState<RotationMode>("both");
  const [speed, setSpeed] = useState(0.3);
  const [darkBg, setDarkBg] = useState(true);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center px-5 py-12 transition-colors ${
        darkBg
          ? "bg-[#0B0B12] text-white"
          : "bg-[#F3F5F8] text-[#082343]"
      }`}
    >
      <div className="w-full max-w-5xl">
        <div className="mb-7 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#08B7B8]">
            AM Portfolio
          </p>

          <h1 className="text-3xl font-bold md:text-5xl">
            AM Logo 3D
          </h1>

          <p className="mt-3 text-sm opacity-60">
            Interactive 360° rotation · Original SVG
          </p>
        </div>

        <div className="relative h-[380px] w-full sm:h-[500px] lg:h-[600px]">
          <AMLogo3D
            mode={mode}
            speed={speed}
            interactive
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {modes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
              className={`rounded-full border px-5 py-3 text-sm transition ${
                mode === item.value
                  ? "border-[#08B7B8] bg-[#08B7B8] text-[#082343]"
                  : "border-current/20 hover:border-[#08B7B8]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-md">
          <div className="mb-3 flex justify-between text-sm">
            <span>Rotation Speed</span>
            <span>{speed.toFixed(2)} rad/s</span>
          </div>

          <input
            type="range"
            min="0.05"
            max="1.5"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-[#08B7B8]"
            aria-label="Rotation speed"
          />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setDarkBg(!darkBg)}
            className="rounded-full border border-current/25 px-6 py-3 text-sm transition hover:border-[#08B7B8]"
          >
            Background: {darkBg ? "Dark" : "Light"}
          </button>
        </div>
      </div>
    </main>
  );
}
