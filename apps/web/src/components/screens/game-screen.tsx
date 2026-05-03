import { useEffect } from "react";
import type { JSX } from "react";

import { startMusic, stopMusic } from "@/lib/sound";
import { useGameStore } from "@/store/game-store";

import { Scene } from "../game/scene";

export const GameScreen = (): JSX.Element => {
  const screen = useGameStore((state) => state.screen);
  const goTo = useGameStore((state) => state.goTo);

  useEffect(() => {
    if (screen === "countdown") {
      goTo("playing");
    }
  }, [screen, goTo]);

  useEffect(() => {
    startMusic();
    return () => {
      stopMusic();
    };
  }, []);

  return <Scene />;
};
