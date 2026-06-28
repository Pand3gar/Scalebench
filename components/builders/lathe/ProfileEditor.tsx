"use client";

// 2D profile editor: drag control points (x = radius ≥ 0, y = height, mm). The
// profile is revolved about the Y axis into a LatheGeometry. See §7.2.
import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfilePoint } from "@/lib/schema/object";

const W = 280;
const H = 380;
const PAD = 28;

export function ProfileEditor({
  profile,
  onChange,
}: {
  profile: ProfilePoint[];
  onChange: (next: ProfilePoint[]) => void;
}) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [drag, setDrag] = React.useState<number | null>(null);
  const [selected, setSelected] = React.useState(0);

  const minY = Math.min(...profile.map((p) => p.y), 0);
  const maxY = Math.max(...profile.map((p) => p.y), 1);
  const maxX = Math.max(...profile.map((p) => p.x), 1);
  const scale = Math.min(
    (W - 2 * PAD) / (maxX * 1.15),
    (H - 2 * PAD) / ((maxY - minY) * 1.1),
  );

  const toPx = (p: ProfilePoint) => ({
    px: PAD + p.x * scale,
    py: H - PAD - (p.y - minY) * scale,
  });

  const fromPx = (clientX: number, clientY: number): ProfilePoint => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    const py = ((clientY - rect.top) / rect.height) * H;
    return {
      x: Math.max(0, (px - PAD) / scale),
      y: minY + (H - PAD - py) / scale,
    };
  };

  const onMove = (e: React.PointerEvent) => {
    if (drag == null) return;
    const p = fromPx(e.clientX, e.clientY);
    const next = profile.map((pt, i) => (i === drag ? p : pt));
    onChange(next);
  };

  const addPoint = () => {
    // Insert a midpoint after the selected point.
    const i = Math.min(selected, profile.length - 2);
    const a = profile[i];
    const b = profile[i + 1] ?? { x: a.x, y: a.y + 20 };
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const next = [...profile.slice(0, i + 1), mid, ...profile.slice(i + 1)];
    onChange(next);
    setSelected(i + 1);
  };

  const removePoint = () => {
    if (profile.length <= 2) return;
    onChange(profile.filter((_, i) => i !== selected));
    setSelected(Math.max(0, selected - 1));
  };

  const right = profile.map(toPx);
  const linePts = right.map((p) => `${p.px},${p.py}`).join(" ");
  const mirror = profile
    .map((p) => {
      const { py } = toPx(p);
      return `${PAD - p.x * scale},${py}`;
    })
    .join(" ");

  return (
    <div className="space-y-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none rounded-lg border border-border bg-secondary/30"
        onPointerMove={onMove}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        {/* Axis of revolution */}
        <line x1={PAD} y1={PAD / 2} x2={PAD} y2={H - PAD / 2} stroke="#3b4a5e" strokeDasharray="4 4" />
        {/* Mirrored outline (visual only) */}
        <polyline points={mirror} fill="none" stroke="#475569" strokeWidth={1} />
        {/* Editable silhouette */}
        <polyline points={linePts} fill="rgba(56,189,248,0.12)" stroke="#38bdf8" strokeWidth={2} />
        {right.map((p, i) => (
          <circle
            key={i}
            cx={p.px}
            cy={p.py}
            r={i === selected ? 7 : 5}
            fill={i === selected ? "#38bdf8" : "#0d1117"}
            stroke="#38bdf8"
            strokeWidth={2}
            className="cursor-grab"
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture(e.pointerId);
              setDrag(i);
              setSelected(i);
            }}
          />
        ))}
      </svg>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={addPoint}>
          <Plus /> Point
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={removePoint}
          disabled={profile.length <= 2}
        >
          <Minus /> Point
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          Drag points · x = radius, y = height (mm)
        </span>
      </div>
    </div>
  );
}
