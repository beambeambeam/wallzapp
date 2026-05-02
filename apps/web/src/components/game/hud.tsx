import type { JSX } from "react";

import { useGameStore } from "@/store/game-store";
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
  score,
  flash,
}: HudProps): JSX.Element => {
  const setLeftArm = useGameStore((state) => state.setLeftArm);
  const setRightArm = useGameStore((state) => state.setRightArm);
  const screen = useGameStore((state) => state.screen);
  const isPlaying = screen === "playing";

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-cyan-200/30 bg-slate-950/68 px-4 py-2 text-sm text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.18)] backdrop-blur-sm">
        Wall {currentWall} / {totalWalls}
      </div>

      <div className="absolute top-4 right-4 rounded-full border border-amber-200/30 bg-slate-950/68 px-4 py-2 text-sm text-amber-50 shadow-[0_0_20px_rgba(251,191,36,0.16)] backdrop-blur-sm">
        Score: {score}
      </div>

      <button
        className="pointer-events-auto absolute right-4 bottom-6 select-none rounded-full border border-cyan-200/20 bg-slate-950/72 px-6 py-4 text-xs text-white backdrop-blur-sm active:bg-cyan-500/30"
        disabled={!isPlaying}
        onPointerDown={() => setRightArm("tucked")}
        onPointerUp={() => setRightArm("out")}
        onPointerLeave={() => setRightArm("out")}
      >
        [D] Right: {armLabel(rightArm)}
      </button>

      <button
        className="pointer-events-auto absolute bottom-6 left-4 select-none rounded-full border border-cyan-200/20 bg-slate-950/72 px-6 py-4 text-xs text-white backdrop-blur-sm active:bg-cyan-500/30"
        disabled={!isPlaying}
        onPointerDown={() => setLeftArm("tucked")}
        onPointerUp={() => setLeftArm("out")}
        onPointerLeave={() => setLeftArm("out")}
      >
        [A] Left: {armLabel(leftArm)}
      </button>

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
