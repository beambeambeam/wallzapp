import type { JSX } from "react";

import { useGameStore } from "@/store/game-store";

import { DifficultySelect } from "./difficulty-select";
import { GameScreen } from "./game-screen";
import { MainMenu } from "./main-menu";
import { ResultScreen } from "./result-screen";

export const GameApp = (): JSX.Element => {
  const screen = useGameStore((state) => state.screen);
  const goTo = useGameStore((state) => state.goTo);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const startRound = useGameStore((state) => state.startRound);
  const startEndless = useGameStore((state) => state.startEndless);
  const retryRound = useGameStore((state) => state.retryRound);
  const resetToMenu = useGameStore((state) => state.resetToMenu);
  const score = useGameStore((state) => state.score);
  const walls = useGameStore((state) => state.walls);
  const wallResults = useGameStore((state) => state.wallResults);
  const gameMode = useGameStore((state) => state.gameMode);

  if (screen === "menu") {
    return <MainMenu onPlay={() => goTo("difficulty")} />;
  }

  if (screen === "difficulty") {
    return (
      <DifficultySelect
        onBack={() => goTo("menu")}
        onChoose={(difficulty) => {
          setDifficulty(difficulty);
          startRound();
        }}
        onEndless={startEndless}
      />
    );
  }

  if (screen === "countdown" || screen === "playing") {
    return <GameScreen />;
  }

  return (
    <ResultScreen
      gameMode={gameMode}
      onMainMenu={resetToMenu}
      onRetry={retryRound}
      score={score}
      totalWalls={walls.length}
      wallResults={wallResults}
    />
  );
};
