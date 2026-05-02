const sounds = {
  hit: new Audio("/audio/default_wall_hit.wav"),
  pass: new Audio("/audio/default_wall_pass.wav"),
};

const music = new Audio("/audio/default_song.mp3");
music.loop = true;

export const playSound = (name: keyof typeof sounds): void => {
  const audio = sounds[name];
  audio.currentTime = 0;
  void audio.play();
};

export const startMusic = (): void => {
  music.currentTime = 0;
  void music.play();
};

export const stopMusic = (): void => {
  music.pause();
  music.currentTime = 0;
};
