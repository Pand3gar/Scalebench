"use client";

// Adds parametric primitives sized by preset dimensions; users then edit the
// dimensions inline in the object list. See implementation.md Phase 0.
import Link from "next/link";
import { Box, Circle, Cylinder, Triangle, Plus, Hammer, Wrench } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useSceneStore } from "@/lib/store/useSceneStore";
import { createPrimitiveFromKind } from "@/lib/objects/factory";
import type { PrimitiveKind } from "@/lib/schema/object";

const ITEMS: { kind: PrimitiveKind; label: string; Icon: typeof Box }[] = [
  { kind: "box", label: "Box", Icon: Box },
  { kind: "sphere", label: "Sphere", Icon: Circle },
  { kind: "cylinder", label: "Cylinder", Icon: Cylinder },
  { kind: "cone", label: "Cone", Icon: Triangle },
];

export function AddObjectMenu() {
  const addObject = useSceneStore((s) => s.addObject);

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Plus className="size-3.5" /> Add primitive
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ITEMS.map(({ kind, label, Icon }) => (
          <Button
            key={kind}
            variant="default"
            size="sm"
            className="justify-center"
            onClick={() => addObject(createPrimitiveFromKind(kind))}
          >
            <Icon /> {label}
          </Button>
        ))}
      </div>

      <div className="mt-3 mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Hammer className="size-3.5" /> Build your own
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/build/lathe"
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          <Cylinder /> Lathe
        </Link>
        <Link
          href="/build/csg"
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          <Wrench /> CSG
        </Link>
      </div>
    </div>
  );
}
