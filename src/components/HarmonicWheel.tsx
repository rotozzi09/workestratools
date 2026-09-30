import { useCallback, useEffect, useRef, useState } from "react";
import { FIELDS, mod, norm } from "@/lib/harmony";
import wheelTexture from "@/assets/wheel-texture.png";

const CX = 170;

const R_OUTER = 164;
const R_DIM_LABEL = 146;
const R_MINOR_LABEL = 113;
const R_MAJOR_LABEL = 78;
const R_HUB = 58;

interface Props {
  index: number;
  onIndexChange: (index: number) => void;
}

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CX + r * Math.sin(a)];
}

/** Annular sector path between radii r0..r1 spanning angles a0..a1 (degrees, 0 = top) */
function sector(r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = polar(r1, a0);
  const [x1, y1] = polar(r1, a1);
  const [x2, y2] = polar(r0, a1);
  const [x3, y3] = polar(r0, a0);
  return `M ${x0} ${y0} A ${r1} ${r1} 0 0 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 0 0 ${x3} ${y3} Z`;
}

export function HarmonicWheel({ index, onIndexChange }: Props) {
  const [rotation, setRotation] = useState(-index * 30);
  const rotRef = useRef(rotation);
  rotRef.current = rotation;

  const dragging = useRef(false);
  const lastAngle = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dragging.current) return;
    const target = -index * 30;
    if (Math.abs(norm(rotRef.current - target)) > 1) {
      setRotation(target);
    }
  }, [index]);

  const angleAt = useCallback((x: number, y: number) => {
    const el = wrapRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return (Math.atan2(y - (rect.top + rect.height / 2), x - (rect.left + rect.width / 2)) * 180) / Math.PI;
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastAngle.current = angleAt(e.clientX, e.clientY);
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const a = angleAt(e.clientX, e.clientY);
    const d = norm(a - lastAngle.current);
    lastAngle.current = a;
    const next = rotRef.current + d;
    rotRef.current = next;
    setRotation(next);
    const live = mod(Math.round(-next / 30), 12);
    if (live !== index) onIndexChange(live);
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const snapped = Math.round(rotRef.current / 30) * 30;
    rotRef.current = snapped;
    setRotation(snapped);
    onIndexChange(mod(Math.round(-snapped / 30), 12));
  };

  const field = FIELDS[index];

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-square w-full max-w-[350px] touch-none select-none"
      style={{
        cursor: dragging.current ? "grabbing" : "grab",
        animation: "wheel-entry 0.8s var(--ease-out-expo) both",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Rotating face */}
      <div
        className="absolute inset-0"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: dragging.current ? "none" : "transform 380ms var(--ease-out-expo)",
        }}
      >
        <svg viewBox="0 0 340 340" className="size-full">
          <defs>
            <clipPath id="wheel-clip">
              <circle cx={CX} cy={CX} r={R_OUTER + 1} />
            </clipPath>
          </defs>
          <g clipPath="url(#wheel-clip)">
            <circle cx={CX} cy={CX} r={R_OUTER + 1} className="fill-card" />
            <image
              href={wheelTexture}
              x={4}
              y={4}
              width={332}
              height={332}
              opacity={0.45}
              preserveAspectRatio="xMidYMid slice"
            />
            {/* Slice boundaries */}
            {Array.from({ length: 12 }, (_, i) => {
              const [x1, y1] = polar(R_HUB, i * 30 + 15);
              const [x2, y2] = polar(R_OUTER, i * 30 + 15);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-border" strokeWidth={1} />
              );
            })}
            {/* Ring separators */}
            {[R_HUB, 98, 130].map((r) => (
              <circle key={r} cx={CX} cy={CX} r={r} fill="none" className="stroke-border" strokeWidth={1} />
            ))}
            <circle cx={CX} cy={CX} r={R_OUTER} fill="none" className="stroke-foreground/30" strokeWidth={1.5} />
            {/* Labels — ordered in fifths, rotating with the face */}
            {FIELDS.map((f, i) => (
              <g key={i} transform={`rotate(${i * 30} ${CX} ${CX})`}>
                <text
                  x={CX}
                  y={CX - R_DIM_LABEL}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground font-mono"
                  fontSize={11}
                  letterSpacing={0.5}
                >
                  {f.dim}
                </text>
                <text
                  x={CX}
                  y={CX - R_MINOR_LABEL}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground font-sans font-semibold"
                  fontSize={13}
                >
                  {f.minor}
                </text>
                <text
                  x={CX}
                  y={CX - R_MAJOR_LABEL}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground font-display"
                  fontSize={26}
                >
                  {f.major}
                </text>
                {f.majorAlt && (
                  <text
                    x={CX}
                    y={CX - R_MAJOR_LABEL + 16}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground font-mono"
                    fontSize={8}
                  >
                    {`/${f.majorAlt}`}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Static viewfinder window (IV · I · V / ii · iii · vi / vii°) */}
      <svg viewBox="0 0 340 340" className="pointer-events-none absolute inset-0 size-full">
        <path d={sector(R_HUB, 98, -46, 46)} className="fill-primary/10 stroke-primary/50" strokeWidth={1} />
        <path d={sector(98, 130, -46, 46)} className="fill-primary/10 stroke-primary/50" strokeWidth={1} />
        <path d={sector(130, R_OUTER, -14, 14)} className="fill-primary/10 stroke-primary/50" strokeWidth={1} />
        <polygon points={`${CX},3 ${CX - 5},13 ${CX + 5},13`} className="fill-primary" />
      </svg>

      {/* Center hub */}
      <div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-foreground text-background"
        style={{ width: `${(R_HUB * 2) / 340 * 100}%`, aspectRatio: "1" }}
      >
        <span className="font-mono text-[7px] uppercase tracking-[0.2em] opacity-60">Campo</span>
        <span className="font-display text-2xl leading-none tracking-tight">{field.major}</span>
      </div>
    </div>
  );
}
