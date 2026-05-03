const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const HIT_FILES = [
  "/audio/hit_random/ElevenLabs_2026-05-03T06_27_04_Rex Thunder - Deep N Tough_pvc_sp100_s50_sb75_se0_b_m2.mp3",
  "/audio/hit_random/ElevenLabs_2026-05-03T06_28_22_Rex Thunder - Deep N Tough_pvc_sp100_s50_sb75_se0_b_m2.mp3",
  "/audio/hit_random/ElevenLabs_2026-05-03T06_29_03_Rex Thunder - Deep N Tough_pvc_sp100_s50_sb75_se0_b_m2.mp3",
  "/audio/hit_random/ElevenLabs_2026-05-03T06_30_02_Rex Thunder - Deep N Tough_pvc_sp100_s50_sb75_se0_b_m2.mp3",
  "/audio/hit_random/ElevenLabs_2026-05-03T06_37_40_Rex Thunder - Deep N Tough_pvc_sp100_s50_sb75_se0_b_m2.wav",
  "/audio/hit_random/ElevenLabs_2026-05-03T06_45_01_Rex Thunder - Deep N Tough_pvc_sp100_s50_sb75_se0_b_m2.wav",
  "/audio/hit_random/ElevenLabs_2026-05-03T06_45_08_Rex Thunder - Deep N Tough_pvc_sp100_s50_sb75_se0_b_m2.wav",
];

const PASS_FILES = [
  "/audio/passed_random/ElevenLabs_2026-05-03T06_37_40_Rex Thunder - Deep N Tough_pvc_sp100_s50_sb75_se0_b_m2.wav",
  "/audio/passed_random/ElevenLabs_2026-05-03T06_45_01_Rex Thunder - Deep N Tough_pvc_sp100_s50_sb75_se0_b_m2.wav",
  "/audio/passed_random/ElevenLabs_2026-05-03T06_45_08_Rex Thunder - Deep N Tough_pvc_sp100_s50_sb75_se0_b_m2.wav",
];

// Pre-load pools for random sounds
const hitPool = HIT_FILES.map((src) => new Audio(src));
const passPool = PASS_FILES.map((src) => new Audio(src));

// One-shot sounds
const countdownSfx: Record<1 | 2 | 3, HTMLAudioElement> = {
  1: new Audio("/audio/countdown_one.wav"),
  2: new Audio("/audio/countdown_two.wav"),
  3: new Audio("/audio/countdown_three.wav"),
};

const goSfx = new Audio("/audio/start_gogogo.wav");
const loseSfx = new Audio("/audio/lose.wav");

const tierSfx: Record<1 | 2 | 3, HTMLAudioElement> = {
  1: new Audio("/audio/tier_01.wav"),
  2: new Audio("/audio/tier_02.wav"),
  3: new Audio("/audio/tier_03.wav"),
};

const music = new Audio("/audio/default_song.mp3");
music.loop = true;

const playOnce = (audio: HTMLAudioElement): void => {
  audio.currentTime = 0;
  void audio.play();
};

export const soundService = {
  playCountdown(value: 1 | 2 | 3): void {
    playOnce(countdownSfx[value]);
  },

  playGo(): void {
    playOnce(goSfx);
  },

  playLose(): void {
    playOnce(loseSfx);
  },

  playSound(name: "hit" | "pass"): void {
    const audio = pickRandom(name === "hit" ? hitPool : passPool);
    playOnce(audio);
  },

  playTier(tier: 1 | 2 | 3): void {
    playOnce(tierSfx[tier]);
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
