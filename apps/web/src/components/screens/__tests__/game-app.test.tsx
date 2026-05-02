import { act, fireEvent, render, screen } from "@testing-library/react";
import type { JSX } from "react";
import { beforeEach, describe, expect, test } from "vitest";

import { GameApp } from "@/components/screens/game-app";
import { useKeyControls } from "@/hooks/use-key-controls";
import { useGameStore } from "@/store/game-store";

const KeyControlsHarness = (): JSX.Element => {
  useKeyControls();

  return <div>key controls mounted</div>;
};

describe("GameApp flow smoke", () => {
  beforeEach(() => {
    useGameStore.getState().resetToMenu();
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
});
