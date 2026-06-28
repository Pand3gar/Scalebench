"use client";

// CSG node-tree editor: add/size/position/rotate primitives and choose the boolean
// op applied against the accumulator. See implementation.md §7.3.
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MmField } from "@/components/builders/MmField";
import { CSG_OPS, CSG_PRIMITIVE_PRESETS, createCsgNode } from "@/lib/builders/csg";
import type { CsgNode, CsgPrimitive, PrimitiveKind, Vec3 } from "@/lib/schema/object";

const KINDS: PrimitiveKind[] = ["box", "sphere", "cylinder", "cone"];
const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

function PrimDims({
  prim,
  onChange,
}: {
  prim: CsgPrimitive;
  onChange: (p: CsgPrimitive) => void;
}) {
  switch (prim.kind) {
    case "box":
      return (
        <div className="grid grid-cols-3 gap-2">
          <MmField label="W" mm={prim.width} onCommit={(v) => onChange({ ...prim, width: v })} />
          <MmField label="H" mm={prim.height} onCommit={(v) => onChange({ ...prim, height: v })} />
          <MmField label="D" mm={prim.depth} onCommit={(v) => onChange({ ...prim, depth: v })} />
        </div>
      );
    case "sphere":
      return (
        <MmField label="⌀" mm={prim.diameter} onCommit={(v) => onChange({ ...prim, diameter: v })} />
      );
    case "cylinder":
    case "cone":
      return (
        <div className="grid grid-cols-2 gap-2">
          <MmField label="⌀" mm={prim.diameter} onCommit={(v) => onChange({ ...prim, diameter: v })} />
          <MmField label="H" mm={prim.height} onCommit={(v) => onChange({ ...prim, height: v })} />
        </div>
      );
  }
}

export function CsgTreeEditor({
  nodes,
  onChange,
}: {
  nodes: CsgNode[];
  onChange: (nodes: CsgNode[]) => void;
}) {
  const update = (id: string, patch: Partial<CsgNode>) =>
    onChange(nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= nodes.length) return;
    const next = nodes.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {nodes.map((node, i) => (
        <div key={node.id} className="rounded-lg border border-border bg-card/60 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              #{i + 1}
            </span>
            {i === 0 ? (
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                base
              </span>
            ) : (
              <select
                value={node.op}
                onChange={(e) => update(node.id, { op: e.target.value as CsgNode["op"] })}
                aria-label="Boolean operation"
                className="h-7 rounded-md border border-input bg-background px-1.5 text-xs"
              >
                {CSG_OPS.map((op) => (
                  <option key={op} value={op}>
                    {op.toLowerCase()}
                  </option>
                ))}
              </select>
            )}
            <select
              value={node.primitive.kind}
              onChange={(e) =>
                update(node.id, {
                  primitive: CSG_PRIMITIVE_PRESETS[e.target.value as PrimitiveKind],
                })
              }
              aria-label="Primitive kind"
              className="h-7 rounded-md border border-input bg-background px-1.5 text-xs"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <div className="ml-auto flex items-center">
              <Button variant="ghost" size="icon" className="size-7" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                <ChevronUp className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-7" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === nodes.length - 1}>
                <ChevronDown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive"
                aria-label="Remove node"
                onClick={() => onChange(nodes.filter((n) => n.id !== node.id))}
                disabled={nodes.length <= 1}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <PrimDims prim={node.primitive} onChange={(p) => update(node.id, { primitive: p })} />

          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["x", "y", "z"] as const).map((axis, ai) => (
              <MmField
                key={axis}
                label={`pos ${axis}`}
                mm={node.position[ai]}
                allowZero
                onCommit={(v) => {
                  const pos = [...node.position] as Vec3;
                  pos[ai] = v;
                  update(node.id, { position: pos });
                }}
              />
            ))}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["x", "y", "z"] as const).map((axis, ai) => (
              <div key={axis} className="flex flex-col gap-0.5">
                <Label>rot {axis} (°)</Label>
                <Input
                  type="number"
                  step="any"
                  className="h-8"
                  value={Number((node.rotation[ai] * RAD2DEG).toFixed(2))}
                  onChange={(e) => {
                    const rot = [...node.rotation] as Vec3;
                    rot[ai] = (parseFloat(e.target.value) || 0) * DEG2RAD;
                    update(node.id, { rotation: rot });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={() => onChange([...nodes, createCsgNode("box", "ADDITION")])}>
        <Plus /> Add primitive
      </Button>
    </div>
  );
}
