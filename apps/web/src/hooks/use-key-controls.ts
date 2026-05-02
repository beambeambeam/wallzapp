import { useEffect } from "react";

import { useGameStore } from "@/store/game-store";

export const useKeyControls = (): void => {
  const screen = useGameStore((state) => state.screen);
  const setLeftArm = useGameStore((state) => state.setLeftArm);
  const setRightArm = useGameStore((state) => state.setRightArm);

  useEffect(() => {
    if (screen !== "playing") {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();

      if (key === "a") {
        setLeftArm("tucked");
      }

      if (key === "d") {
        setRightArm("tucked");
      }
    };

    const onKeyUp = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();

      if (key === "a") {
        setLeftArm("out");
      }

      if (key === "d") {
        setRightArm("out");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [screen, setLeftArm, setRightArm]);
};
