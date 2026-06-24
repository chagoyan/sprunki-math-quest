// Lightweight WebAudio sound effects — no asset downloads required.
let ctx: AudioContext | null = null;
let isMuted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.15, when = 0) {
  if (isMuted) return;
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + when);
  g.gain.setValueAtTime(0, ac.currentTime + when);
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + when);
  osc.stop(ac.currentTime + when + duration + 0.02);
}

export const sound = {
  correct() {
    tone(660, 0.12, "triangle", 0.18, 0);
    tone(880, 0.16, "triangle", 0.18, 0.1);
    tone(1320, 0.22, "triangle", 0.16, 0.22);
  },
  wrong() {
    tone(220, 0.18, "sine", 0.15, 0);
    tone(180, 0.22, "sine", 0.15, 0.12);
  },
  tap() {
    tone(520, 0.06, "square", 0.08);
  },
  levelUp() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "triangle", 0.2, i * 0.1));
  },
  unlock() {
    [392, 523, 659, 784, 988].forEach((f, i) => tone(f, 0.16, "sine", 0.18, i * 0.08));
  },
  setMuted(muted: boolean) {
    isMuted = muted;
  },
};
