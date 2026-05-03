import type { JSX } from "react";

import type { ArmState, GameMode, WallResult } from "@/types/game";

interface HudProps {
  currentWall: number;
  totalWalls: number;
  leftArm: ArmState;
  rightArm: ArmState;
  progress: number;
  score: number;
  flash: WallResult | null;
  gameMode: GameMode;
  endlessSpeed?: number;
  tierIndex?: number;
  wallResults: WallResult[];
}

const armLabel = (state: ArmState): string => (state === "out" ? "OUT" : "TUCKED");

const TIER_LABELS = ["WARM UP", "HEATING UP", "ON FIRE", "INSANE"];
const TIER_COLORS = [
  "text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]",
  "text-yellow-300 border-yellow-400/40 shadow-[0_0_12px_rgba(250,204,21,0.35)]",
  "text-orange-400 border-orange-400/40 shadow-[0_0_14px_rgba(251,146,60,0.45)]",
  "text-rose-400 border-rose-500/50 shadow-[0_0_18px_rgba(244,63,94,0.55)]",
];

export const HUD = ({
  currentWall,
  totalWalls,
  leftArm,
  rightArm,
  score,
  flash,
  gameMode,
  endlessSpeed,
  tierIndex = 0,
  wallResults,
}: HudProps): JSX.Element => {
  const clampedTier = Math.min(tierIndex, TIER_LABELS.length - 1);

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Wall counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-cyan-200/30 bg-slate-950/68 px-4 py-2 text-sm text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.18)] backdrop-blur-sm">
        {gameMode === "endless" ? `Wall ${currentWall}` : `Wall ${currentWall} / ${totalWalls}`}
      </div>

      {/* Endless: speed + tier badge */}
      {gameMode === "endless" && endlessSpeed !== undefined ? (
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          <div className="rounded-full border border-rose-300/30 bg-slate-950/68 px-4 py-2 text-sm text-rose-200 shadow-[0_0_20px_rgba(251,113,133,0.18)] backdrop-blur-sm">
            Speed: {endlessSpeed.toFixed(0)}
          </div>
          <div
            className={`rounded-full border bg-slate-950/72 px-4 py-1.5 text-xs font-bold tracking-widest backdrop-blur-sm ${TIER_COLORS[clampedTier]}`}
          >
            {TIER_LABELS[clampedTier]}
          </div>
        </div>
      ) : null}

      {/* Score */}
      <div className="absolute top-4 right-4 rounded-full border border-amber-200/30 bg-slate-950/68 px-4 py-2 text-sm text-amber-50 shadow-[0_0_20px_rgba(251,191,36,0.16)] backdrop-blur-sm">
        Score: {score}
      </div>

      {/* Endless history dots */}
      {gameMode === "endless" ? (
        <div className="absolute top-14 left-1/2 flex -translate-x-1/2 gap-1">
          {wallResults.map((result, index) => (
            <div
              className={`h-2 w-2 rounded-full ${result === "pass" ? "bg-emerald-400" : "bg-rose-500"}`}
              key={`dot-${index + 1}`}
            />
          ))}
        </div>
      ) : null}

      {/* Arm indicators */}
      <div className="absolute right-4 bottom-6 rounded-full border border-cyan-200/20 bg-slate-950/72 px-4 py-2 text-xs text-white backdrop-blur-sm">
        [D] Right: {armLabel(rightArm)}
      </div>
      <div className="absolute bottom-6 left-4 rounded-full border border-cyan-200/20 bg-slate-950/72 px-4 py-2 text-xs text-white backdrop-blur-sm">
        [A] Left: {armLabel(leftArm)}
      </div>

      {/* Pass / Fail flash */}
      {flash ? (
        <div
          className={`absolute inset-0 grid place-items-center text-5xl font-bold text-white ${
            flash === "pass" ? "bg-emerald-400/28" : "bg-rose-500/32"
          }`}
        >
          {flash === "pass" ? "PASS!" : "FAIL!"}
        </div>
      ) : null}
    </div>
  );
};
