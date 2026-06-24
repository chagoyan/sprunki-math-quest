/*
 * Kid-friendly generative background music via Web Audio API.
 * Plays a soft pentatonic loop until stop() is called.
 * Will be replaced with real audio files when the user adds them.
 */

let ac: AudioContext | null = null;
let intervalId: number | null = null;
let isPlaying = false;

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0]; // C5, D5, E5, G5, A5
const LOW_PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0]; // C4, D4, E4, G4, A4

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ac) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ac = new Ctor();
  }
  return ac;
}

function playNote(freq: number, duration: number, startTime: number, gain = 0.04, type: OscillatorType = "triangle") {
  const context = ac;
  if (!context) return;
  const osc = context.createOscillator();
  const g = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(gain, startTime + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(g).connect(context.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function playChord(freqs: number[], duration: number, startTime: number) {
  freqs.forEach((f, i) => playNote(f, duration, startTime + i * 0.02, 0.025, "sine"));
}

function nextPhrase() {
  const context = getCtx();
  if (!context || !isPlaying) return;

  const now = context.currentTime;
  const beat = 0.4; // BPM ~150 but soft and gentle

  // Melody line using pentatonic notes
  const melody = [
    PENTATONIC[0], PENTATONIC[1], PENTATONIC[2], PENTATONIC[1],
    PENTATONIC[0], PENTATONIC[2], PENTATONIC[3], PENTATONIC[4],
  ];

  melody.forEach((freq, i) => {
    playNote(freq, beat * 0.8, now + i * beat, 0.035, "triangle");
  });

  // Soft bass pad every other beat
  [0, 2, 4, 6].forEach((i) => {
    playChord([LOW_PENTATONIC[0], LOW_PENTATONIC[2]], beat * 1.5, now + i * beat);
  });
}

export const music = {
  start() {
    if (isPlaying) return;
    const context = getCtx();
    if (!context) return;
    isPlaying = true;
    nextPhrase();
    intervalId = window.setInterval(nextPhrase, 3200);
  },

  stop() {
    isPlaying = false;
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  },

  get isPlaying() {
    return isPlaying;
  },

  setMuted(muted: boolean) {
    if (muted) {
      this.stop();
    }
  },
};
