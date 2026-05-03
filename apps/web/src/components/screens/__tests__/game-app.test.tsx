import { act, fireEvent, render, screen } from "@testing-library/react";
import type { JSX } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { GameApp } from "@/components/screens/game-app";
import { useKeyControls } from "@/hooks/use-key-controls";
import { useGameStore } from "@/store/game-store";

const KeyControlsHarness = (): JSX.Element => {
  useKeyControls();

  return <div>key controls mounted</div>;
};

interface MockGamepadButton {
  pressed: boolean;
}

const createMockButtons = (): MockGamepadButton[] =>
  Array.from({ length: 4 }, () => ({
    pressed: false,
  }));

describe("GameApp flow smoke", () => {
  let animationFrameCallback: FrameRequestCallback | null = null;
  let nextAnimationFrameId = 1;
  let gamepadButtons: MockGamepadButton[];

  beforeEach(() => {
    useGameStore.getState().resetToMenu();
    animationFrameCallback = null;
    nextAnimationFrameId = 1;
    gamepadButtons = createMockButtons();

    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: vi.fn((frameHandler: FrameRequestCallback) => {
        animationFrameCallback = frameHandler;
        nextAnimationFrameId += 1;
        return nextAnimationFrameId;
      }),
      writable: true,
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: vi.fn(() => {
        animationFrameCallback = null;
      }),
      writable: true,
    });
    Object.defineProperty(navigator, "getGamepads", {
      configurable: true,
      value: vi.fn(() => [{ buttons: gamepadButtons } as Gamepad, null, null, null]),
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("can go from difficulty selection to countdown start", () => {
    render(<GameApp />);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));

    expect(screen.getByText("Select Difficulty")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start Easy" }));

    expect(useGameStore.getState().screen).toBe("countdown");
    expect(useGameStore.getState().walls).toHaveLength(10);
  });

  test("hold controls tuck and release arms only while playing", () => {
    render(<KeyControlsHarness />);

    fireEvent.keyDown(window, { key: "a" });
    fireEvent.keyDown(window, { key: "d" });

    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");

    act(() => {
      useGameStore.getState().goTo("playing");
    });

    fireEvent.keyDown(window, { key: "a" });
    expect(useGameStore.getState().leftArm).toBe("tucked");
    expect(useGameStore.getState().rightArm).toBe("out");

    fireEvent.keyDown(window, { key: "d" });
    expect(useGameStore.getState().leftArm).toBe("tucked");
    expect(useGameStore.getState().rightArm).toBe("tucked");

    fireEvent.keyUp(window, { key: "a" });
    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("tucked");

    fireEvent.keyUp(window, { key: "d" });
    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");

    act(() => {
      useGameStore.getState().goTo("result");
    });

    fireEvent.keyDown(window, { key: "a" });
    fireEvent.keyDown(window, { key: "d" });

    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");
  });

  test("gamepad face buttons control arms only while playing and compose with keyboard input", () => {
    render(<KeyControlsHarness />);

    const runGamepadFrame = (): void => {
      expect(animationFrameCallback).not.toBeNull();
      act(() => {
        animationFrameCallback?.(performance.now());
      });
    };
    const setGamepadButtonPressed = (index: number, pressed: boolean): void => {
      const button = gamepadButtons[index];

      if (!button) {
        throw new Error(`Missing mock gamepad button at index ${index}`);
      }

      button.pressed = pressed;
    };

    setGamepadButtonPressed(0, true);

    expect(animationFrameCallback).toBeNull();
    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");

    act(() => {
      useGameStore.getState().goTo("playing");
    });

    runGamepadFrame();
    expect(useGameStore.getState().leftArm).toBe("tucked");
    expect(useGameStore.getState().rightArm).toBe("out");

    setGamepadButtonPressed(0, false);
    setGamepadButtonPressed(2, true);
    runGamepadFrame();
    expect(useGameStore.getState().leftArm).toBe("tucked");

    setGamepadButtonPressed(2, false);
    runGamepadFrame();
    expect(useGameStore.getState().leftArm).toBe("out");

    setGamepadButtonPressed(1, true);
    runGamepadFrame();
    expect(useGameStore.getState().rightArm).toBe("tucked");

    setGamepadButtonPressed(1, false);
    setGamepadButtonPressed(3, true);
    runGamepadFrame();
    expect(useGameStore.getState().rightArm).toBe("tucked");

    fireEvent.keyDown(window, { key: "a" });
    expect(useGameStore.getState().leftArm).toBe("tucked");

    setGamepadButtonPressed(3, false);
    setGamepadButtonPressed(2, true);
    runGamepadFrame();
    expect(useGameStore.getState().leftArm).toBe("tucked");
    expect(useGameStore.getState().rightArm).toBe("out");

    setGamepadButtonPressed(2, false);
    runGamepadFrame();
    expect(useGameStore.getState().leftArm).toBe("tucked");

    fireEvent.keyUp(window, { key: "a" });
    expect(useGameStore.getState().leftArm).toBe("out");

    setGamepadButtonPressed(1, true);
    runGamepadFrame();
    expect(useGameStore.getState().rightArm).toBe("tucked");

    fireEvent.keyDown(window, { key: "d" });
    expect(useGameStore.getState().rightArm).toBe("tucked");

    fireEvent.keyUp(window, { key: "d" });
    expect(useGameStore.getState().rightArm).toBe("tucked");

    setGamepadButtonPressed(1, false);
    runGamepadFrame();
    expect(useGameStore.getState().rightArm).toBe("out");

    act(() => {
      useGameStore.getState().goTo("result");
    });

    setGamepadButtonPressed(0, true);
    expect(animationFrameCallback).toBeNull();
    expect(useGameStore.getState().leftArm).toBe("out");
    expect(useGameStore.getState().rightArm).toBe("out");
  });
});
