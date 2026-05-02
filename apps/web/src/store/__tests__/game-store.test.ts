import { beforeEach, describe, expect, test } from "vitest";

import { useGameStore } from "@/store/game-store";

describe("gameStore", () => {
  beforeEach(() => {
    useGameStore.getState().resetToMenu();
  });

  test("startRound resets state correctly", () => {
    useGameStore.getState().setDifficulty("medium");
    useGameStore.getState().startRound();

    const state = useGameStore.getState();

    expect(state.screen).toBe("countdown");
    expect(state.currentWallIndex).toBe(0);
    expect(state.score).toBe(0);
    expect(state.leftArm).toBe("out");
    expect(state.rightArm).toBe("out");
    expect(state.walls).toHaveLength(10);
  });

  test("resolveCurrentWall updates score and results", () => {
    useGameStore.getState().startRound();
    useGameStore.getState().resolveCurrentWall("pass");

    const state = useGameStore.getState();

    expect(state.score).toBe(1);
    expect(state.wallResults).toEqual(["pass"]);
    expect(state.showFlash).toBe("pass");
  });

  test("advanceWall transitions to result after final wall", () => {
    useGameStore.getState().startRound();

    for (let index = 0; index < 10; index += 1) {
      useGameStore.getState().resolveCurrentWall("fail");
      useGameStore.getState().advanceWall();
    }

    const state = useGameStore.getState();
    expect(state.screen).toBe("result");
    expect(state.wallResults).toHaveLength(10);
  });
});
