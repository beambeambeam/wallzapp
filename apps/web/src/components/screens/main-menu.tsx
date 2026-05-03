import type { JSX } from "react";

interface MainMenuProps {
  onPlay: () => void;
}

export const MainMenu = ({ onPlay }: MainMenuProps): JSX.Element => (
  <div
    style={{
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.85)",
      color: "white",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
      inset: 0,
      justifyContent: "center",
      position: "fixed",
    }}
    onClick={onPlay}
  >
    <h1
      style={{
        fontSize: "clamp(2rem, 5vw, 4rem)",
        margin: 0,
        textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
      }}
    >
      FPS Shooter
    </h1>
    <p
      style={{
        fontSize: "clamp(0.8rem, 2vw, 1.1rem)",
        lineHeight: 1.8,
        marginTop: "1rem",
        textAlign: "center",
      }}
    >
      Click to Play
      <br />
      ESC — Menu
      <br />
      WASD / Arrows — Move
      <br />
      Left Mouse / Spacebar — Fire
      <br />
      M — Music
    </p>
  </div>
);
