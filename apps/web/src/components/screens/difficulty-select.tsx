import type { JSX } from "react";

import { DIFFICULTY_CONFIG } from "@/constants/difficulty";
import type { Difficulty } from "@/types/game";

interface DifficultySelectProps {
  onBack: () => void;
  onChoose: (difficulty: Difficulty) => void;
}

const difficulties: { value: Difficulty; label: string; color: string }[] = [
  { color: "#22c55e", label: "Easy", value: "easy" },
  { color: "#facc15", label: "Medium", value: "medium" },
  { color: "#ef4444", label: "Hard", value: "hard" },
];

export const DifficultySelect = ({ onBack, onChoose }: DifficultySelectProps): JSX.Element => (
  <div
    style={{
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.9)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
      gap: "1.5rem",
      inset: 0,
      justifyContent: "center",
      position: "fixed",
    }}
  >
    <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", margin: 0 }}>Select Difficulty</h1>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        justifyContent: "center",
      }}
    >
      {difficulties.map(({ value, label, color }) => {
        const cfg = DIFFICULTY_CONFIG[value];
        return (
          <button
            key={value}
            onClick={() => onChoose(value)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: `2px solid ${color}`,
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              fontSize: "1rem",
              minWidth: "160px",
              padding: "1.5rem 2rem",
            }}
          >
            <div
              style={{
                color,
                fontSize: "1.4rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              Speed: {cfg.wallSpeed} | {cfg.wallCount} targets
              <br />
              Reaction: {cfg.reactionSeconds}s
            </div>
          </button>
        );
      })}
    </div>
    <button
      onClick={onBack}
      style={{
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: "4px",
        color: "white",
        cursor: "pointer",
        padding: "0.5rem 1.5rem",
      }}
    >
      Back
    </button>
  </div>
);
