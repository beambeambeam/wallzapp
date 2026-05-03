import type { JSX } from "react";

import type { WallResult } from "@/types/game";

interface HudProps {
  currentWall: number;
  totalWalls: number;
  score: number;
  flash: WallResult | null;
  // Retained for call-site compatibility; not rendered in FPS mode
  leftArm?: unknown;
  rightArm?: unknown;
  progress?: number;
}

export const HUD = ({ currentWall, totalWalls, score, flash }: HudProps): JSX.Element => (
  <div style={{ inset: 0, pointerEvents: "none", position: "absolute" }}>
    {/* Targets remaining */}
    <div
      style={{
        background: "rgba(0,0,0,0.6)",
        borderRadius: "20px",
        color: "#67e8f9",
        fontFamily: "Arial, sans-serif",
        fontSize: "0.85rem",
        left: 16,
        padding: "6px 16px",
        position: "absolute",
        top: 16,
      }}
    >
      Targets: {totalWalls - currentWall + 1} / {totalWalls}
    </div>

    {/* Score */}
    <div
      style={{
        background: "rgba(0,0,0,0.6)",
        borderRadius: "20px",
        color: "#fde68a",
        fontFamily: "Arial, sans-serif",
        fontSize: "0.85rem",
        padding: "6px 16px",
        position: "absolute",
        right: 16,
        top: 16,
      }}
    >
      Score: {score}
    </div>

    {/* Crosshair */}
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: 20,
        justifyContent: "center",
        left: "50%",
        position: "absolute",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 20,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.8)",
          height: 20,
          position: "absolute",
          width: 2,
        }}
      />
      <div
        style={{
          background: "rgba(255,255,255,0.8)",
          height: 2,
          position: "absolute",
          width: 20,
        }}
      />
    </div>

    {/* Hit/miss flash overlay */}
    {flash ? (
      <div
        style={{
          alignItems: "center",
          background: flash === "pass" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.3)",
          color: "white",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          fontSize: "3rem",
          fontWeight: "bold",
          inset: 0,
          justifyContent: "center",
          position: "absolute",
        }}
      >
        {flash === "pass" ? "HIT!" : "MISS!"}
      </div>
    ) : null}
  </div>
);
