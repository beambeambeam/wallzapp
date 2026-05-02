import type { Difficulty, DifficultyConfig } from "@/types/game";

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
