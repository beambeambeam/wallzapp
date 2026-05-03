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

  test("setLeftArm updates only the left arm", () => {
    useGameStore.getState().setRightArm("out");
    useGameStore.getState().setLeftArm("tucked");

    expect(useGameStore.getState().leftArm).toBe("tucked");
    expect(useGameStore.getState().rightArm).toBe("out");

    useGameStore.getState().setLeftArm("out");

    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");
  });

  test("setRightArm updates only the right arm", () => {
    useGameStore.getState().setLeftArm("out");
    useGameStore.getState().setRightArm("tucked");

    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("tucked");

    useGameStore.getState().setRightArm("out");

    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");
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

  test("advanceWall preserves held arm state for the next wall", () => {
    useGameStore.getState().startRound();
    useGameStore.getState().setLeftArm("tucked");
    useGameStore.getState().setRightArm("tucked");
    useGameStore.getState().resolveCurrentWall("pass");
    useGameStore.getState().advanceWall();

    const state = useGameStore.getState();

    expect(state.currentWallIndex).toBe(1);
    expect(state.leftArm).toBe("tucked");
    expect(state.rightArm).toBe("tucked");
  });

  test("retryRound resets both arms to out", () => {
    useGameStore.getState().startRound();
    useGameStore.getState().setLeftArm("tucked");
    useGameStore.getState().setRightArm("tucked");
    useGameStore.getState().retryRound();

    const state = useGameStore.getState();

    expect(state.screen).toBe("countdown");
    expect(state.leftArm).toBe("out");
    expect(state.rightArm).toBe("out");
  });
});
