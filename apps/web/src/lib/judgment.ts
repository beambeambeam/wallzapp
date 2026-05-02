import type { ArmState, WallConfig } from "@/types/game";

export interface JudgmentInput {
  leftArm: ArmState;
  rightArm: ArmState;
  requiredWall: WallConfig;
  timingOffsetMs: number;
  leniencyMs: number;
}

export const judgeWall = ({
  leftArm,
  rightArm,
  requiredWall,
  timingOffsetMs,
  leniencyMs,
}: JudgmentInput): boolean => {
  const isPoseMatch = leftArm === requiredWall.leftArm && rightArm === requiredWall.rightArm;
  const isWithinWindow = Math.abs(timingOffsetMs) <= leniencyMs;

  return isPoseMatch && isWithinWindow;
};
