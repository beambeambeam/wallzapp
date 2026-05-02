import { describe, expect, test } from "vitest";

import { generateWalls } from "@/lib/wall-generator";

describe("generateWalls", () => {
  test("returns exactly the requested wall count", () => {
    const walls = generateWalls(10);

    expect(walls).toHaveLength(10);
  });

  test("creates valid arm states", () => {
    const walls = generateWalls(10);

    for (const wall of walls) {
      expect(["out", "tucked"]).toContain(wall.leftArm);
      expect(["out", "tucked"]).toContain(wall.rightArm);
    }
  });

  test("creates unique ids", () => {
    const walls = generateWalls(10);
    const ids = new Set(walls.map((wall) => wall.id));

    expect(ids.size).toBe(10);
  });
});
