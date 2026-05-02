import type { JSX } from "react";

import type { ArmState } from "@/types/game";

import { Model } from "./ch31-non-pbr";

interface CharacterProps {
  leftArm: ArmState;
  rightArm: ArmState;
}

export const Character = ({ leftArm, rightArm }: CharacterProps): JSX.Element => (
  <Model leftArm={leftArm} rightArm={rightArm} />
);
