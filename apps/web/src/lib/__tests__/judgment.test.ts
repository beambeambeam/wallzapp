import { describe, expect, test } from "vitest";

import { judgeWall } from "@/lib/judgment";

describe("judgeWall", () => {
  const requiredWall = {
    id: "wall-1",
    leftArm: "out",
    rightArm: "tucked",
  } as const;

  test("passes on exact pose match within leniency", () => {
    const result = judgeWall({
      leftArm: "out",
      leniencyMs: 200,
      requiredWall,
      rightArm: "tucked",
      timingOffsetMs: 120,
    });

    expect(result).toBe(true);
  });

  test("fails when outside leniency despite pose match", () => {
    const result = judgeWall({
      leftArm: "out",
      leniencyMs: 200,
      requiredWall,
      rightArm: "tucked",
      timingOffsetMs: 280,
    });

    expect(result).toBe(false);
  });

  test("fails on pose mismatch even inside leniency", () => {
    const result = judgeWall({
      leftArm: "tucked",
      leniencyMs: 200,
      requiredWall,
      rightArm: "tucked",
      timingOffsetMs: 0,
    });

    expect(result).toBe(false);
  });
});
