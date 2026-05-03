import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";

import { useControlPressState } from "@/hooks/use-control-press-state";
import { useKeyControls } from "@/hooks/use-key-controls";
import { soundService } from "@/lib/sound";
import { useGameStore } from "@/store/game-store";

import { Scene } from "../game/scene";

const HOLD_TO_START_DURATION_MS = 500;

type CountdownPhase = "hold-to-start" | "countdown";

export const GameScreen = (): JSX.Element => {
  const goTo = useGameStore((state) => state.goTo);
  const screen = useGameStore((state) => state.screen);
  const { leftPressed, rightPressed } = useControlPressState(screen === "countdown");
  const [countdown, setCountdown] = useState<number>(3);
  const [countdownPhase, setCountdownPhase] = useState<CountdownPhase>("hold-to-start");
  const [holdProgressMs, setHoldProgressMs] = useState<number>(0);
  const holdProgressRef = useRef(0);
  const leftPressedRef = useRef(leftPressed);
  const rightPressedRef = useRef(rightPressed);

  useKeyControls();

  useEffect(() => {
    leftPressedRef.current = leftPressed;
    rightPressedRef.current = rightPressed;
  }, [leftPressed, rightPressed]);

  useEffect(() => {
    if (screen === "playing") {
      soundService.startMusic();
    }

    return () => {
      soundService.stopMusic();
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== "countdown") {
      return;
    }

    setCountdownPhase("hold-to-start");
    setHoldProgressMs(0);
    holdProgressRef.current = 0;
    setCountdown(3);
    soundService.playCountdown(3);
  }, [screen]);

  useEffect(() => {
    if (screen !== "countdown" || countdownPhase !== "hold-to-start") {
      return;
    }

    let animationFrameId = 0;
    let previousTimestamp: number | null = null;

    const updateHoldProgress = (timestamp: number): void => {
      if (leftPressedRef.current && rightPressedRef.current) {
        const elapsedMs = previousTimestamp === null ? 0 : timestamp - previousTimestamp;
        const nextProgressMs = Math.min(
          holdProgressRef.current + elapsedMs,
          HOLD_TO_START_DURATION_MS,
        );

        holdProgressRef.current = nextProgressMs;
        setHoldProgressMs((currentValue) =>
          currentValue === nextProgressMs ? currentValue : nextProgressMs,
        );

        if (nextProgressMs >= HOLD_TO_START_DURATION_MS) {
          setCountdownPhase("countdown");
          previousTimestamp = null;
          return;
        }
      } else if (holdProgressRef.current !== 0) {
        holdProgressRef.current = 0;
        setHoldProgressMs(0);
      }

      previousTimestamp = timestamp;
      animationFrameId = window.requestAnimationFrame(updateHoldProgress);
    };

    animationFrameId = window.requestAnimationFrame(updateHoldProgress);

    return () => {
      previousTimestamp = null;
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [countdownPhase, screen]);

  useEffect(() => {
    if (screen !== "countdown" || countdownPhase !== "countdown") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(intervalId);
          soundService.playGo();
          goTo("playing");
          return 0;
        }

        const next = (value - 1) as 1 | 2 | 3;
        soundService.playCountdown(next);
        return next;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [countdownPhase, goTo, screen]);

  useEffect(() => {
    if (screen === "countdown" && countdownPhase === "countdown" && countdown === 0) {
      goTo("playing");
    }
  }, [countdown, countdownPhase, goTo, screen]);

  if (screen === "countdown") {
    if (countdownPhase === "hold-to-start") {
      const holdProgressPercent = (holdProgressMs / HOLD_TO_START_DURATION_MS) * 100;

      return (
        <div className="grid h-screen w-screen place-items-center bg-black px-6 text-white">
          <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold md:text-6xl">Hold both controls to start</h1>
              <p className="text-sm text-white/80 md:text-lg">Keyboard: A + D</p>
              <p className="text-sm text-white/80 md:text-lg">Gamepad: A/X + B/Y</p>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full border border-white/30">
              <div
                aria-hidden="true"
                className="h-full bg-white transition-[width] duration-75"
                style={{ width: `${holdProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid h-screen w-screen place-items-center bg-black text-8xl font-bold text-white">
        {countdown}
      </div>
    );
  }

  return <Scene />;
};
