import { useEffect, useRef, useState } from "react";

const GAMEPAD_BUTTON_A = 0;
const GAMEPAD_BUTTON_B = 1;
const GAMEPAD_BUTTON_X = 2;
const GAMEPAD_BUTTON_Y = 3;

interface ControlPressState {
  leftPressed: boolean;
  rightPressed: boolean;
}

export const useControlPressState = (active: boolean): ControlPressState => {
  const keyboardLeftPressedRef = useRef(false);
  const keyboardRightPressedRef = useRef(false);
  const gamepadLeftPressedRef = useRef(false);
  const gamepadRightPressedRef = useRef(false);
  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);

  useEffect(() => {
    if (!active) {
      keyboardLeftPressedRef.current = false;
      keyboardRightPressedRef.current = false;
      gamepadLeftPressedRef.current = false;
      gamepadRightPressedRef.current = false;
      setLeftPressed(false);
      setRightPressed(false);
      return;
    }

    let animationFrameId = 0;

    const syncPressedState = (): void => {
      const nextLeftPressed = keyboardLeftPressedRef.current || gamepadLeftPressedRef.current;
      const nextRightPressed = keyboardRightPressedRef.current || gamepadRightPressedRef.current;

      setLeftPressed((currentValue) =>
        currentValue === nextLeftPressed ? currentValue : nextLeftPressed,
      );
      setRightPressed((currentValue) =>
        currentValue === nextRightPressed ? currentValue : nextRightPressed,
      );
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();

      if (key === "a") {
        keyboardLeftPressedRef.current = true;
      }

      if (key === "d") {
        keyboardRightPressedRef.current = true;
      }

      syncPressedState();
    };

    const onKeyUp = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();

      if (key === "a") {
        keyboardLeftPressedRef.current = false;
      }

      if (key === "d") {
        keyboardRightPressedRef.current = false;
      }

      syncPressedState();
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

      syncPressedState();
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
      setLeftPressed(false);
      setRightPressed(false);
    };
  }, [active]);

  return {
    leftPressed,
    rightPressed,
  };
};
