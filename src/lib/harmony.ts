export interface KeyField {
  /** Primary spelling of the major tonic (as engraved on the wheel) */
  major: string;
  /** Enharmonic alternative, when relevant (F#/Gb, Db/C#, Ab/G#) */
  majorAlt?: string;
  /** Relative minor (middle ring) */
  minor: string;
  /** vii° diminished (outer ring) */
  dim: string;
  /** Diatonic chords I, ii, iii, IV, V, vi, vii° */
  chords: [string, string, string, string, string, string, string];
}

export const DEGREES = ["I", "ii", "iii", "IV", "V", "vi", "vii°"] as const;

export const FIELDS: KeyField[] = [
  { major: "C", minor: "Am", dim: "B°", chords: ["C", "Dm", "Em", "F", "G", "Am", "B°"] },
  { major: "G", minor: "Em", dim: "F#°", chords: ["G", "Am", "Bm", "C", "D", "Em", "F#°"] },
  { major: "D", minor: "Bm", dim: "C#°", chords: ["D", "Em", "F#m", "G", "A", "Bm", "C#°"] },
  { major: "A", minor: "F#m", dim: "G#°", chords: ["A", "Bm", "C#m", "D", "E", "F#m", "G#°"] },
  { major: "E", minor: "C#m", dim: "D#°", chords: ["E", "F#m", "G#m", "A", "B", "C#m", "D#°"] },
  { major: "B", minor: "G#m", dim: "A#°", chords: ["B", "C#m", "D#m", "E", "F#", "G#m", "A#°"] },
  { major: "F#", majorAlt: "Gb", minor: "D#m", dim: "E°", chords: ["F#", "G#m", "A#m", "B", "C#", "D#m", "E°"] },
  { major: "Db", majorAlt: "C#", minor: "Bbm", dim: "C°", chords: ["Db", "Ebm", "Fm", "Gb", "Ab", "Bbm", "C°"] },
  { major: "Ab", majorAlt: "G#", minor: "Fm", dim: "G°", chords: ["Ab", "Bbm", "Cm", "Db", "Eb", "Fm", "G°"] },
  { major: "Eb", minor: "Cm", dim: "D°", chords: ["Eb", "Fm", "Gm", "Ab", "Bb", "Cm", "D°"] },
  { major: "Bb", minor: "Gm", dim: "A°", chords: ["Bb", "Cm", "Dm", "Eb", "F", "Gm", "A°"] },
  { major: "F", minor: "Dm", dim: "E°", chords: ["F", "Gm", "Am", "Bb", "C", "Dm", "E°"] },
];

export const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Normalize an angle in degrees to [-180, 180) */
export const norm = (a: number) => mod(a + 180, 360) - 180;

/* ---------- Scale / chord theory (major + harmonic minor) ---------- */
export type Mode = "major" | "minor";

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const NAT = [0, 2, 4, 5, 7, 9, 11];
const STEPS: Record<Mode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 11], // harmonic minor
};
export const MODE_DEGREES: Record<Mode, string[]> = {
  major: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  minor: ["i", "ii°", "III+", "iv", "V", "VI", "vii°"],
};
const SUFFIX: Record<Mode, string[]> = {
  major: ["", "m", "m", "", "", "m", "°"],
  minor: ["m", "°", "+", "m", "", "", "°"],
};

const acc = (n: number) => (n > 0 ? "#".repeat(n) : "b".repeat(-n));

export function pitchOf(name: string) {
  const l = LETTERS.indexOf(name[0]!);
  let p = NAT[l]!;
  for (const c of name.slice(1)) p += c === "#" ? 1 : c === "b" ? -1 : 0;
  return mod(p, 12);
}

export interface Scale {
  tonic: string;
  notes: string[];
  chords: string[];
  degrees: string[];
  /** MIDI notes of each triad (root position, around C4) */
  triads: number[][];
}

export function buildScale(field: KeyField, mode: Mode): Scale {
  const tonic = mode === "major" ? field.major : field.minor.replace(/m$/, "");
  const l0 = LETTERS.indexOf(tonic[0]!);
  const p0 = pitchOf(tonic);
  const pcs = STEPS[mode].map((s) => mod(p0 + s, 12));
  const notes = pcs.map((pc, i) => {
    const l = (l0 + i) % 7;
    const diff = norm((pc - NAT[l]!) * 30) / 30; // -6..5
    return LETTERS[l]! + acc(diff);
  });
  const chords = notes.map((n, i) => n + SUFFIX[mode][i]);
  const triads = pcs.map((_, i) => {
    const root = 60 + pcs[i]!;
    const third = pcs[(i + 2) % 7]!;
    const fifth = pcs[(i + 4) % 7]!;
    const up = (pc: number, above: number) => {
      let m = 60 + pc;
      while (m <= above) m += 12;
      return m;
    };
    const t = up(third, root);
    return [root, t, up(fifth, t)];
  });
  return { tonic, notes, chords, degrees: MODE_DEGREES[mode], triads };
}
