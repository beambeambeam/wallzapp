import { useEffect, useRef } from "react";

import { useGameStore } from "@/store/game-store";

const GAMEPAD_BUTTON_A = 0;
const GAMEPAD_BUTTON_B = 1;
const GAMEPAD_BUTTON_X = 2;
const GAMEPAD_BUTTON_Y = 3;

export const useKeyControls = (): void => {
  const screen = useGameStore((state) => state.screen);
  const setLeftArm = useGameStore((state) => state.setLeftArm);
  const setRightArm = useGameStore((state) => state.setRightArm);
  const keyboardLeftPressedRef = useRef(false);
  const keyboardRightPressedRef = useRef(false);
  const gamepadLeftPressedRef = useRef(false);
  const gamepadRightPressedRef = useRef(false);
  const leftArmStateRef = useRef<"out" | "tucked">("out");
  const rightArmStateRef = useRef<"out" | "tucked">("out");

  useEffect(() => {
    if (screen !== "playing") {
      return;
    }

    let animationFrameId = 0;

    const syncArmState = (): void => {
      const nextLeftArmState =
        keyboardLeftPressedRef.current || gamepadLeftPressedRef.current ? "tucked" : "out";
      const nextRightArmState =
        keyboardRightPressedRef.current || gamepadRightPressedRef.current ? "tucked" : "out";

      if (leftArmStateRef.current !== nextLeftArmState) {
        leftArmStateRef.current = nextLeftArmState;
        setLeftArm(nextLeftArmState);
      }

      if (rightArmStateRef.current !== nextRightArmState) {
        rightArmStateRef.current = nextRightArmState;
        setRightArm(nextRightArmState);
      }
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();

      if (key === "a") {
        keyboardLeftPressedRef.current = true;
      }

      if (key === "d") {
        keyboardRightPressedRef.current = true;
      }

      syncArmState();
    };

    const onKeyUp = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();

      if (key === "a") {
        keyboardLeftPressedRef.current = false;
      }

      if (key === "d") {
        keyboardRightPressedRef.current = false;
      }

      syncArmState();
    };

    const pollGamepad = (): void => {
      const gamepads = navigator.getGamepads();
      const activeGamepad = gamepads.find((gamepad) => gamepad !== null);

      if (activeGamepad) {
        gamepadLeftPressedRef.current =
          activeGamepad.buttons[GAMEPAD_BUTTON_A]?.pressed === true ||
          activeGamepad.buttons[GAMEPAD_BUTTON_X]?.pressed === true;
        gamepadRightPressedRef.current =
          activeGamepad.buttons[GAMEPAD_BUTTON_B]?.pressed === true ||
          activeGamepad.buttons[GAMEPAD_BUTTON_Y]?.pressed === true;
      } else {
        gamepadLeftPressedRef.current = false;
        gamepadRightPressedRef.current = false;
      }

      syncArmState();
      animationFrameId = window.requestAnimationFrame(pollGamepad);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    animationFrameId = window.requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.cancelAnimationFrame(animationFrameId);
      keyboardLeftPressedRef.current = false;
      keyboardRightPressedRef.current = false;
      gamepadLeftPressedRef.current = false;
      gamepadRightPressedRef.current = false;
      leftArmStateRef.current = "out";
      rightArmStateRef.current = "out";
      setLeftArm("out");
      setRightArm("out");
    };
  }, [screen, setLeftArm, setRightArm]);
};
