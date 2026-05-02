import type { JSX } from "react";

import type { ArmState, WallResult } from "@/types/game";

interface HudProps {
  currentWall: number;
  totalWalls: number;
  leftArm: ArmState;
  rightArm: ArmState;
  progress: number;
  score: number;
  flash: WallResult | null;
}

const armLabel = (state: ArmState): string => (state === "out" ? "OUT" : "TUCKED");

export const HUD = ({
  currentWall,
  totalWalls,
  leftArm,
  rightArm,
  progress,
  score,
  flash,
}: HudProps): JSX.Element => (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-md bg-black/50 px-4 py-2 text-sm text-white">
      Wall {currentWall} / {totalWalls}
    </div>

    <div className="absolute top-4 right-4 rounded-md bg-black/50 px-4 py-2 text-sm text-white">
      Score: {score}
    </div>

    <div className="absolute right-4 bottom-6 rounded-md bg-black/50 px-4 py-2 text-xs text-white">
      [D] Right: {armLabel(rightArm)}
    </div>
    <div className="absolute bottom-6 left-4 rounded-md bg-black/50 px-4 py-2 text-xs text-white">
      [A] Left: {armLabel(leftArm)}
    </div>

    <div className="absolute top-16 left-1/2 h-2 w-72 -translate-x-1/2 overflow-hidden rounded-full bg-white/25">
      <div
        className="h-full bg-cyan-300 transition-[width] duration-75"
        style={{ width: `${Math.max(0, Math.min(progress, 1)) * 100}%` }}
      />
    </div>

    {flash ? (
      <div
        className={`absolute inset-0 grid place-items-center text-5xl font-bold text-white ${
          flash === "pass" ? "bg-green-500/35" : "bg-red-500/35"
        }`}
      >
        {flash === "pass" ? "PASS!" : "FAIL!"}
      </div>
    ) : null}
  </div>
);
