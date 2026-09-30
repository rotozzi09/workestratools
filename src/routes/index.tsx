import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { HarmonicWheel } from "@/components/HarmonicWheel";
import { DEGREES, FIELDS, mod } from "@/lib/harmony";
import { playTonic } from "@/lib/sound";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Círculo de Campos Harmônicos" },
      {
        name: "description",
        content:
          "Gire o círculo e veja os acordes do campo harmônico de cada tonalidade — I, ii, iii, IV, V, vi e vii° no círculo de quintas.",
      },
      { property: "og:title", content: "Círculo de Campos Harmônicos" },
      {
        property: "og:description",
        content: "Roda interativa dos campos harmônicos: gire e veja os acordes de cada tonalidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const prevIndex = useRef(index);
  const field = FIELDS[index]!;

  useEffect(() => {
    if (prevIndex.current === index) return;
    prevIndex.current = index;
    if (soundOn) playTonic(field.major);
  }, [index, soundOn, field.major]);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center bg-background font-sans text-foreground">
      <div className="flex w-full max-w-md flex-col items-center px-5 pb-8 pt-6">
        {/* Header */}
        <header className="flex w-full items-center justify-between animate-[slide-up_0.6s_var(--ease-out-expo)_both]">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Círculo de Quintas · v1.0
            </span>
            <h1 className="font-display text-2xl uppercase leading-none tracking-tight">
              Campos Harmônicos
            </h1>
          </div>
          <button
            onClick={() => setSoundOn((s) => !s)}
            aria-label={soundOn ? "Desativar som" : "Ativar som"}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition-transform active:scale-95"
          >
            {soundOn ? (
              <Volume2 className="size-4 text-primary" />
            ) : (
              <VolumeX className="size-4 text-muted-foreground" />
            )}
          </button>
        </header>

        {/* Wheel */}
        <section className="mt-4 w-full">
          <HarmonicWheel index={index} onIndexChange={setIndex} />
        </section>

        {/* Controls */}
        <div className="mt-5 flex w-full items-center justify-between">
          <button
            onClick={() => setIndex((i) => mod(i - 1, 12))}
            aria-label="Tonalidade anterior"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition-transform active:scale-95"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {String(index + 1).padStart(2, "0")} / 12 · gire o círculo
          </span>
          <button
            onClick={() => setIndex((i) => mod(i + 1, 12))}
            aria-label="Próxima tonalidade"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition-transform active:scale-95"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Readout */}
        <section className="mt-6 w-full space-y-4 animate-[slide-up_0.6s_var(--ease-out-expo)_both]">
          <div className="flex items-end justify-between gap-2 border-b border-border pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Campo Diatônico
            </span>
            <span className="text-right font-mono text-[10px] uppercase tracking-widest text-primary">
              {field.major}
              {field.majorAlt ? ` / ${field.majorAlt}` : ""} · relativa {field.minor}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DEGREES.map((deg, di) => (
              <div
                key={deg}
                className={
                  di === 0
                    ? "flex flex-col items-center rounded-sm bg-foreground py-3 text-background"
                    : "flex flex-col items-center rounded-sm border border-border py-3"
                }
              >
                <span
                  className={`mb-1 font-mono text-[9px] ${di === 0 ? "opacity-60" : "text-muted-foreground"}`}
                >
                  {deg}
                </span>
                <span className={di === 0 ? "font-display text-lg" : "font-sans text-base font-semibold"}>
                  {field.chords[di]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4">
          <div className="flex items-center gap-3 rounded-full bg-foreground/5 px-4 py-1.5">
            <span className="font-mono text-[10px] tracking-tight">I · ii · iii · IV · V · vi · vii°</span>
            <div className="h-3 w-px bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-tight text-primary">
              12 tonalidades
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
