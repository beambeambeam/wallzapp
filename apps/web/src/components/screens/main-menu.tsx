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
      <CardHeader className="items-center">
        <CardTitle className="w-full">
          <img
            alt="Wallzapp logo"
            className="mx-auto h-auto max-h-100 w-full max-w-md object-contain mb-4"
            src="/logo.png"
          />
        </CardTitle>
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
