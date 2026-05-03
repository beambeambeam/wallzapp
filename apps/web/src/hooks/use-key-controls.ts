import { useEffect, useRef } from "react";

export interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export const useKeyControls = (): React.RefObject<MovementState> => {
  const movement = useRef<MovementState>({
    backward: false,
    forward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const k = e.code;
      if (k === "KeyW" || k === "ArrowUp") {movement.current.forward = true;}
      if (k === "KeyS" || k === "ArrowDown") {movement.current.backward = true;}
      if (k === "KeyA" || k === "ArrowLeft") {movement.current.left = true;}
      if (k === "KeyD" || k === "ArrowRight") {movement.current.right = true;}
    };
    const onKeyUp = (e: KeyboardEvent): void => {
      const k = e.code;
      if (k === "KeyW" || k === "ArrowUp") {movement.current.forward = false;}
      if (k === "KeyS" || k === "ArrowDown") {movement.current.backward = false;}
      if (k === "KeyA" || k === "ArrowLeft") {movement.current.left = false;}
      if (k === "KeyD" || k === "ArrowRight") {movement.current.right = false;}
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return movement;
};
