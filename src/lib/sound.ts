/** Pitch class (0 = C) for each tonic spelling used on the wheel */
const PITCH: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11,
};

let ctx: AudioContext | null = null;

/** Play the tonic of a key as a short, soft plucked tone (C4 octave) */
export function playTonic(note: string) {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();

    const t = ctx.currentTime;
    const midi = 60 + (PITCH[note] ?? 0);
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);

    // Triangle body + quiet sine an octave up for a warm, woody click
    const body = ctx.createOscillator();
    body.type = "triangle";
    body.frequency.value = freq;
    body.connect(gain);
    body.start(t);
    body.stop(t + 1.2);

    const bodyGain = ctx.createGain();
    bodyGain.gain.value = 0.3;
    const spark = ctx.createOscillator();
    spark.type = "sine";
    spark.frequency.value = freq * 2;
    spark.connect(bodyGain);
    bodyGain.connect(gain);
    spark.start(t);
    spark.stop(t + 0.6);
  } catch {
    // Audio unavailable — stay silent
  }
}
