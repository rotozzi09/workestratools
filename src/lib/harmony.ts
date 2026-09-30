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
  { major: "F", minor: "Am", dim: "E°", chords: ["F", "Gm", "Am", "Bb", "C", "Dm", "E°"] },
];

export const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Normalize an angle in degrees to [-180, 180) */
export const norm = (a: number) => mod(a + 180, 360) - 180;
