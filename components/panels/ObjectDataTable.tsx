"use client";

// Accessible measurement readout — a semantic table mirroring the 3D scene, since
// the WebGL canvas is not natively screen-reader accessible. See §7.10.
import { useSceneStore } from "@/lib/store/useSceneStore";
import { formatMmValue, UNIT_REGISTRY } from "@/lib/engine/units";

export function ObjectDataTable() {
  const objects = useSceneStore((s) => s.objects);
  const unit = useSceneStore((s) => s.displayUnit);
  const u = UNIT_REGISTRY[unit].label;

  if (objects.length === 0) return null;

  return (
    <table className="w-full border-collapse text-xs">
      <caption className="sr-only">
        Objects in the comparison and their real-world dimensions in {u}
      </caption>
      <thead>
        <tr className="text-left text-muted-foreground">
          <th scope="col" className="py-1 pr-2 font-medium">Object</th>
          <th scope="col" className="py-1 px-1 text-right font-medium">W ({u})</th>
          <th scope="col" className="py-1 px-1 text-right font-medium">H ({u})</th>
          <th scope="col" className="py-1 pl-1 text-right font-medium">D ({u})</th>
        </tr>
      </thead>
      <tbody>
        {objects.map((o) => (
          <tr key={o.id} className="border-t border-border/60">
            <th scope="row" className="py-1 pr-2 text-left font-normal">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-sm"
                  style={{ backgroundColor: o.color }}
                  aria-hidden
                />
                {o.label}
              </span>
            </th>
            <td className="py-1 px-1 text-right tabular-nums">
              {formatMmValue(o.dimensions.width, unit)}
            </td>
            <td className="py-1 px-1 text-right tabular-nums">
              {formatMmValue(o.dimensions.height, unit)}
            </td>
            <td className="py-1 pl-1 text-right tabular-nums">
              {formatMmValue(o.dimensions.depth, unit)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
