import type { ArmState, WallConfig } from "@/types/game";

const TUCKED_CHANCE = 0.6;

const getRandomArmState = (): ArmState => (Math.random() < TUCKED_CHANCE ? "tucked" : "out");

export const generateWalls = (count: number): WallConfig[] => {
  const walls: WallConfig[] = [];

  for (let index = 0; index < count; index += 1) {
    walls.push({
      id: `wall-${index + 1}-${Math.random().toString(36).slice(2, 8)}`,
      leftArm: getRandomArmState(),
      rightArm: getRandomArmState(),
    });
  }

  return walls;
};
