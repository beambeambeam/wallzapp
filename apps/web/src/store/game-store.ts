import { create } from "zustand";

import { DIFFICULTY_CONFIG } from "@/constants/difficulty";
import { generateWalls } from "@/lib/wall-generator";
import type { ArmState, Difficulty, ScreenState, WallConfig, WallResult } from "@/types/game";

interface GameStore {
  screen: ScreenState;
  difficulty: Difficulty;
  walls: WallConfig[];
  currentWallIndex: number;
  score: number;
  leftArm: ArmState;
  rightArm: ArmState;
  wallResults: WallResult[];
  showFlash: WallResult | null;
  goTo: (screen: ScreenState) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  startRound: () => void;
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
    const { currentWallIndex, walls } = get();
    const nextIndex = currentWallIndex + 1;

    if (nextIndex >= walls.length) {
      set({ screen: "result" });
      return;
    }

    set({
      currentWallIndex: nextIndex,
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
    const { difficulty } = get();
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
  setLeftArm: (leftArm) => set({ leftArm }),
  setRightArm: (rightArm) => set({ rightArm }),
  startRound: () => {
    const { difficulty } = get();
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
}));
