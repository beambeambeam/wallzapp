import { useEffect } from "react";

import { useGameStore } from "@/store/game-store";

export const useKeyControls = (): void => {
  const screen = useGameStore((state) => state.screen);
  const toggleLeftArm = useGameStore((state) => state.toggleLeftArm);
  const toggleRightArm = useGameStore((state) => state.toggleRightArm);

  useEffect(() => {
    if (screen !== "playing") {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();

      if (key === "a") {
        toggleLeftArm();
      }

      if (key === "d") {
        toggleRightArm();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [screen, toggleLeftArm, toggleRightArm]);
};
