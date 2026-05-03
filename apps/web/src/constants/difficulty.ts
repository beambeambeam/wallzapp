import type { Difficulty, DifficultyConfig } from "@/types/game";

export const ENDLESS_INITIAL_SPEED = 20;
export const ENDLESS_INITIAL_LENIENCY_MS = 320;
export const ENDLESS_MIN_LENIENCY_MS = 80;

/**
 * Speed tiers for endless mode.
 * Each tier runs for `wallCount` walls, then the next tier kicks in.
 * `speedIncrement` is added to wall speed after each wall in that tier.
 * `leniencyDecrement` is subtracted from leniency after each wall (floored at ENDLESS_MIN_LENIENCY_MS).
 * The last tier repeats indefinitely.
 */
export interface EndlessTier {
  wallCount: number;
  speedIncrement: number;
  leniencyDecrement: number;
}

export const ENDLESS_TIERS: EndlessTier[] = [
  { leniencyDecrement: 4, speedIncrement: 5, wallCount: 3 }, // walls 1–3:   slow ramp
  { leniencyDecrement: 8, speedIncrement: 8, wallCount: 5 }, // walls 4–6:   medium ramp
  { leniencyDecrement: 12, speedIncrement: 12, wallCount: 5 }, // walls 7–9:   fast ramp
  { leniencyDecrement: 15, speedIncrement: 5, wallCount: Infinity }, // wall 10+: brutal
];

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    complexity: [1, 2],
    interWallDelayMs: 1500,
    leniencyMs: 300,
    reactionSeconds: 3,
    wallCount: 10,
    wallSpeed: 22,
  },
  hard: {
    complexity: [3, 4],
    interWallDelayMs: 1500,
    leniencyMs: 120,
    reactionSeconds: 1.2,
    wallCount: 10,
    wallSpeed: 50,
  },
  medium: {
    complexity: [2, 3],
    interWallDelayMs: 1500,
    leniencyMs: 200,
    reactionSeconds: 2,
    wallCount: 10,
    wallSpeed: 33,
  },
} as const;
