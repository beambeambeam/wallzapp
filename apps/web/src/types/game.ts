export type Difficulty = "easy" | "medium" | "hard";

export type ArmState = "out" | "tucked";

export interface WallConfig {
  id: string;
  leftArm: ArmState;
  rightArm: ArmState;
}

export type WallResult = "pass" | "fail";

export type ScreenState = "menu" | "difficulty" | "countdown" | "playing" | "result";

export interface DifficultyConfig {
  wallSpeed: number;
  reactionSeconds: number;
  complexity: [number, number];
  leniencyMs: number;
  interWallDelayMs: number;
  wallCount: number;
}
