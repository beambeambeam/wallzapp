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
  toggleLeftArm: () => void;
  toggleRightArm: () => void;
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
  toggleLeftArm: () => {
    const { leftArm } = get();
    set({ leftArm: leftArm === "out" ? "tucked" : "out" });
  },
  toggleRightArm: () => {
    const { rightArm } = get();
    set({ rightArm: rightArm === "out" ? "tucked" : "out" });
  },
}));
