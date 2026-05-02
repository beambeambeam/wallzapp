import type { ArmState, WallConfig } from "@/types/game";

const ARM_STATES: ArmState[] = ["out", "tucked"];

export const generateWalls = (count: number): WallConfig[] => {
  const walls: WallConfig[] = [];

  for (let index = 0; index < count; index += 1) {
    walls.push({
      id: `wall-${index + 1}-${Math.random().toString(36).slice(2, 8)}`,
      leftArm: ARM_STATES[Math.round(Math.random())] ?? "out",
      rightArm: ARM_STATES[Math.round(Math.random())] ?? "out",
    });
  }

  return walls;
};
