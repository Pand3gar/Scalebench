"use client";

// Numeric field that edits an mm value but displays/accepts the active unit.
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSceneStore } from "@/lib/store/useSceneStore";
import { fromMm, toMm, UNIT_REGISTRY } from "@/lib/engine/units";

export function MmField({
  label,
  mm,
  onCommit,
  allowZero = false,
}: {
  label: string;
  mm: number;
  onCommit: (mm: number) => void;
  allowZero?: boolean;
}) {
  const unit = useSceneStore((s) => s.displayUnit);
  const [text, setText] = React.useState(() =>
    String(Number(fromMm(mm, unit).toFixed(4))),
  );

  React.useEffect(() => {
    setText(String(Number(fromMm(mm, unit).toFixed(4))));
  }, [mm, unit]);

  const commit = () => {
    const v = parseFloat(text);
    const ok = Number.isFinite(v) && (allowZero ? v >= 0 : v > 0);
    if (ok) onCommit(toMm(v, unit));
    else setText(String(Number(fromMm(mm, unit).toFixed(4))));
  };

  return (
    <div className="flex flex-col gap-0.5">
      <Label>
        {label} ({UNIT_REGISTRY[unit].label})
      </Label>
      <Input
        type="number"
        step="any"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="h-8"
      />
    </div>
  );
}
