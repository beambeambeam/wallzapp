type SoundName = "hit" | "pass";

const sfx: Record<SoundName, HTMLAudioElement> = {
  hit: new Audio("/audio/default_wall_hit.wav"),
  pass: new Audio("/audio/default_wall_pass.wav"),
};

const music = new Audio("/audio/default_song.mp3");
music.loop = true;

export const soundService = {
  playSound(name: SoundName): void {
    const audio = sfx[name];
    audio.currentTime = 0;
    void audio.play();
  },

  startMusic(): void {
    music.currentTime = 0;
    void music.play();
  },

  stopMusic(): void {
    music.pause();
    music.currentTime = 0;
  },
};
