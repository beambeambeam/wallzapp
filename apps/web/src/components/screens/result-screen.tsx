import type { JSX } from "react";

import type { WallResult } from "@/types/game";

interface ResultScreenProps {
  score: number;
  totalWalls: number;
  wallResults: WallResult[];
  onRetry: () => void;
  onMainMenu: () => void;
}

export const ResultScreen = ({
  score,
  totalWalls,
  wallResults,
  onRetry,
  onMainMenu,
}: ResultScreenProps): JSX.Element => (
  <div
    style={{
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.9)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
      gap: "1rem",
      inset: 0,
      justifyContent: "center",
      position: "fixed",
    }}
  >
    <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", margin: 0 }}>Mission Complete</h1>
    <p style={{ fontSize: "1.5rem", margin: 0 }}>
      Score: {score} / {totalWalls}
    </p>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        justifyContent: "center",
        maxWidth: "600px",
      }}
    >
      {wallResults.map((result, index) => (
        <span
          key={`result-${index + 1}`}
          style={{
            background: result === "pass" ? "#22c55e" : "#ef4444",
            borderRadius: "4px",
            fontSize: "0.85rem",
            fontWeight: "bold",
            padding: "0.25rem 0.75rem",
          }}
        >
          Target {index + 1}
        </span>
      ))}
    </div>
    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
      <button
        onClick={onRetry}
        style={{
          background: "#22c55e",
          border: "none",
          borderRadius: "4px",
          color: "white",
          cursor: "pointer",
          fontSize: "1rem",
          padding: "0.75rem 2rem",
        }}
      >
        Retry
      </button>
      <button
        onClick={onMainMenu}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: "4px",
          color: "white",
          cursor: "pointer",
          fontSize: "1rem",
          padding: "0.75rem 2rem",
        }}
      >
        Main Menu
      </button>
    </div>
  </div>
);
