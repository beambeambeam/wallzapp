import { useEffect, useState } from "react";
import type { JSX } from "react";

import { useKeyControls } from "@/hooks/use-key-controls";
import { startMusic, stopMusic } from "@/lib/sound";
import { useGameStore } from "@/store/game-store";

import { Scene } from "../game/scene";

export const GameScreen = (): JSX.Element => {
  const goTo = useGameStore((state) => state.goTo);
  const screen = useGameStore((state) => state.screen);
  const [countdown, setCountdown] = useState<number>(3);

  useKeyControls();

  useEffect(() => {
    if (screen === "playing") {
      startMusic();
    }

    return () => {
      stopMusic();
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== "countdown") {
      return;
    }

    setCountdown(3);
    const intervalId = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(intervalId);
          goTo("playing");
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [goTo, screen]);

  if (screen === "countdown") {
    return (
      <div className="grid h-screen w-screen place-items-center bg-black text-8xl font-bold text-white">
        {countdown}
      </div>
    );
  }

  return <Scene />;
};
