import { create } from "zustand";

import {
  DIFFICULTY_CONFIG,
  ENDLESS_INITIAL_LENIENCY_MS,
  ENDLESS_INITIAL_SPEED,
  ENDLESS_MIN_LENIENCY_MS,
  ENDLESS_TIERS,
} from "@/constants/difficulty";
import { generateWalls } from "@/lib/wall-generator";
import type { ArmState, Difficulty, GameMode, ScreenState, WallConfig, WallResult } from "@/types/game";

interface GameStore {
  screen: ScreenState;
  difficulty: Difficulty;
  gameMode: GameMode;
  walls: WallConfig[];
  currentWallIndex: number;
  score: number;
  leftArm: ArmState;
  rightArm: ArmState;
  wallResults: WallResult[];
  showFlash: WallResult | null;
  endlessWallSpeed: number;
  endlessLeniencyMs: number;
  goTo: (screen: ScreenState) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setGameMode: (mode: GameMode) => void;
  startRound: () => void;
  startEndless: () => void;
  setLeftArm: (state: ArmState) => void;
  setRightArm: (state: ArmState) => void;
  resolveCurrentWall: (result: WallResult) => void;
  advanceWall: () => void;
  resetToMenu: () => void;
  retryRound: () => void;
  clearFlash: () => void;
}

const initialState = {
  currentWallIndex: 0,
  difficulty: "easy" as const,
  endlessLeniencyMs: ENDLESS_INITIAL_LENIENCY_MS,
  endlessWallSpeed: ENDLESS_INITIAL_SPEED,
  gameMode: "classic" as const,
  leftArm: "out" as const,
  rightArm: "out" as const,
  score: 0,
  screen: "menu" as const,
  showFlash: null,
  wallResults: [],
  walls: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  advanceWall: () => {
    const { currentWallIndex, walls, gameMode, endlessWallSpeed, endlessLeniencyMs } = get();
    const nextIndex = currentWallIndex + 1;

    if (gameMode === "endless") {
      // Resolve which tier applies to the wall that just completed (nextIndex - 1).
      let wallsSeen = 0;
      let tier = ENDLESS_TIERS[ENDLESS_TIERS.length - 1];
      for (const t of ENDLESS_TIERS) {
        wallsSeen += t.wallCount;
        if (nextIndex <= wallsSeen) {
          tier = t;
          break;
        }
      }
      const newSpeed = endlessWallSpeed + tier.speedIncrement;
      const newLeniency = Math.max(endlessLeniencyMs - tier.leniencyDecrement, ENDLESS_MIN_LENIENCY_MS);
      const newWall = generateWalls(1)[0];
      set({
        currentWallIndex: nextIndex,
        endlessLeniencyMs: newLeniency,
        endlessWallSpeed: newSpeed,
        leftArm: "out",
        rightArm: "out",
        showFlash: null,
        walls: [...walls, newWall],
      });
      return;
    }

    if (nextIndex >= walls.length) {
      set({ screen: "result" });
      return;
    }

    set({
      currentWallIndex: nextIndex,
      leftArm: "out",
      rightArm: "out",
      showFlash: null,
    });
  },
  clearFlash: () => set({ showFlash: null }),
  goTo: (screen) => set({ screen }),
  resetToMenu: () => set({ ...initialState }),
  resolveCurrentWall: (result) => {
    const { score, wallResults } = get();
    set({
      score: result === "pass" ? score + 1 : score,
      showFlash: result,
      wallResults: [...wallResults, result],
    });
  },
  retryRound: () => {
    const { difficulty, gameMode } = get();
    if (gameMode === "endless") {
      set({
        ...initialState,
        gameMode: "endless",
        screen: "countdown",
        walls: generateWalls(1),
      });
      return;
    }
    const { wallCount } = DIFFICULTY_CONFIG[difficulty];
    set({
      currentWallIndex: 0,
      leftArm: "out",
      rightArm: "out",
      score: 0,
      screen: "countdown",
      showFlash: null,
      wallResults: [],
      walls: generateWalls(wallCount),
    });
  },
  setDifficulty: (difficulty) => set({ difficulty }),
  setGameMode: (gameMode) => set({ gameMode }),
  setLeftArm: (leftArm) => set({ leftArm }),
  setRightArm: (rightArm) => set({ rightArm }),
  startEndless: () => {
    set({
      ...initialState,
      endlessLeniencyMs: ENDLESS_INITIAL_LENIENCY_MS,
      endlessWallSpeed: ENDLESS_INITIAL_SPEED,
      gameMode: "endless",
      screen: "countdown",
      walls: generateWalls(1),
    });
  },
  startRound: () => {
    const { difficulty } = get();
    const { wallCount } = DIFFICULTY_CONFIG[difficulty];
    set({
      currentWallIndex: 0,
      gameMode: "classic",
      leftArm: "out",
      rightArm: "out",
      score: 0,
      screen: "countdown",
      showFlash: null,
      wallResults: [],
      walls: generateWalls(wallCount),
    });
  },
}));
