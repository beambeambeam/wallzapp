import { Button } from "@wallzapp/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wallzapp/ui/components/card";
import type { JSX } from "react";

interface MainMenuProps {
  onPlay: () => void;
}

export const MainMenu = ({ onPlay }: MainMenuProps): JSX.Element => (
  <main className="grid min-h-screen place-items-center bg-linear-to-br from-slate-950 via-sky-950 to-amber-950 p-4">
    <Card className="w-full max-w-2xl text-center">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Hole In The Wall 3D</CardTitle>
        <CardDescription>
          Match the wall pose before it reaches you. Hold <strong>A</strong> to tuck the left arm
          and <strong>D</strong> to tuck the right arm. Release to return each arm to out.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-fit" onClick={onPlay} size="lg">
          Play
        </Button>
      </CardContent>
    </Card>
  </main>
);
