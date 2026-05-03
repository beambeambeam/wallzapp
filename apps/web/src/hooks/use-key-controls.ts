import { useEffect, useRef } from "react";

import { useControlPressState } from "@/hooks/use-control-press-state";
import { useGameStore } from "@/store/game-store";

export const useKeyControls = (): void => {
  const screen = useGameStore((state) => state.screen);
  const setLeftArm = useGameStore((state) => state.setLeftArm);
  const setRightArm = useGameStore((state) => state.setRightArm);
  const { leftPressed, rightPressed } = useControlPressState(screen === "playing");
  const leftArmStateRef = useRef<"out" | "tucked">("out");
  const rightArmStateRef = useRef<"out" | "tucked">("out");

  useEffect(() => {
    if (screen !== "playing") {
      leftArmStateRef.current = "out";
      rightArmStateRef.current = "out";
      setLeftArm("out");
      setRightArm("out");
      return;
    }

    const nextLeftArmState = leftPressed ? "tucked" : "out";
    const nextRightArmState = rightPressed ? "tucked" : "out";

    if (leftArmStateRef.current !== nextLeftArmState) {
      leftArmStateRef.current = nextLeftArmState;
      setLeftArm(nextLeftArmState);
    }

    if (rightArmStateRef.current !== nextRightArmState) {
      rightArmStateRef.current = nextRightArmState;
      setRightArm(nextRightArmState);
    }

    return () => {
      leftArmStateRef.current = "out";
      rightArmStateRef.current = "out";
      setLeftArm("out");
      setRightArm("out");
    };
  }, [leftPressed, rightPressed, screen, setLeftArm, setRightArm]);
};
