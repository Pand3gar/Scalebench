"use client";

// Reorderable object list (dnd-kit) with inline dimension editing. Editing a value
// converts from the active display unit to mm and revalidates via the store.
import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSceneStore } from "@/lib/store/useSceneStore";
import { fromMm, toMm } from "@/lib/engine/units";
import { primitiveDimensions } from "@/lib/geometry/primitive";
import { dimensionLabel } from "@/lib/scene/labels";
import type {
  PrimitiveShape,
  SceneObject,
} from "@/lib/schema/object";

function DimField({
  label,
  mm,
  onCommit,
}: {
  label: string;
  mm: number;
  onCommit: (mm: number) => void;
}) {
  const unit = useSceneStore((s) => s.displayUnit);
  const [text, setText] = React.useState(() => String(fromMm(mm, unit)));

  // Re-sync when the underlying value or unit changes externally.
  React.useEffect(() => {
    setText(String(Number(fromMm(mm, unit).toFixed(4))));
  }, [mm, unit]);

  const commit = () => {
    const value = parseFloat(text);
    if (Number.isFinite(value) && value > 0) onCommit(toMm(value, unit));
    else setText(String(Number(fromMm(mm, unit).toFixed(4))));
  };

  return (
    <div className="flex flex-col gap-0.5">
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        step="any"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}

function PrimitiveDimEditor({ object }: { object: SceneObject }) {
  const updateObject = useSceneStore((s) => s.updateObject);
  if (object.shape.source !== "primitive") return null;
  const shape = object.shape.shape;

  const apply = (next: PrimitiveShape) => {
    updateObject(object.id, {
      shape: { source: "primitive", shape: next },
      dimensions: primitiveDimensions(next),
    });
  };

  switch (shape.kind) {
    case "box":
      return (
        <div className="grid grid-cols-3 gap-2">
          <DimField label="Width" mm={shape.width} onCommit={(w) => apply({ ...shape, width: w })} />
          <DimField label="Height" mm={shape.height} onCommit={(h) => apply({ ...shape, height: h })} />
          <DimField label="Depth" mm={shape.depth} onCommit={(d) => apply({ ...shape, depth: d })} />
        </div>
      );
    case "sphere":
      return (
        <div className="grid grid-cols-2 gap-2">
          <DimField label="Diameter" mm={shape.diameter} onCommit={(d) => apply({ ...shape, diameter: d })} />
        </div>
      );
    case "cylinder":
    case "cone":
      return (
        <div className="grid grid-cols-2 gap-2">
          <DimField label="Diameter" mm={shape.diameter} onCommit={(d) => apply({ ...shape, diameter: d })} />
          <DimField label="Height" mm={shape.height} onCommit={(h) => apply({ ...shape, height: h })} />
        </div>
      );
  }
}

function ReadOnlyDims({ object }: { object: SceneObject }) {
  const unit = useSceneStore((s) => s.displayUnit);
  const sourceLabel =
    object.shape.source === "catalog"
      ? "Catalog model"
      : object.shape.source === "lathe"
        ? "Lathe build"
        : "CSG build";
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/20 px-2 py-1.5 text-xs">
      <span className="text-muted-foreground">{sourceLabel}</span>
      <span className="tabular-nums">{dimensionLabel(object, unit)}</span>
    </div>
  );
}

function SortableItem({ object }: { object: SceneObject }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: object.id });
  const select = useSceneStore((s) => s.select);
  const selectedId = useSceneStore((s) => s.selectedId);
  const updateObject = useSceneStore((s) => s.updateObject);
  const removeObject = useSceneStore((s) => s.removeObject);
  const selected = selectedId === object.id;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      onClick={() => select(object.id)}
      className={cn(
        "rounded-lg border border-border bg-card/60 p-3",
        selected && "outline outline-2 outline-ring -outline-offset-1",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Reorder ${object.label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <input
          type="color"
          value={object.color}
          onChange={(e) => updateObject(object.id, { color: e.target.value })}
          aria-label={`${object.label} color`}
          className="h-5 w-5 shrink-0 cursor-pointer rounded border border-border bg-transparent"
          onClick={(e) => e.stopPropagation()}
        />
        <Input
          value={object.label}
          onChange={(e) => updateObject(object.id, { label: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="h-7 flex-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Object name"
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={object.visible ? "Hide object" : "Show object"}
          onClick={(e) => {
            e.stopPropagation();
            updateObject(object.id, { visible: !object.visible });
          }}
        >
          {object.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${object.label}`}
          onClick={(e) => {
            e.stopPropagation();
            removeObject(object.id);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        {object.shape.source === "primitive" ? (
          <PrimitiveDimEditor object={object} />
        ) : (
          <ReadOnlyDims object={object} />
        )}
      </div>
    </li>
  );
}

export function ObjectListPanel() {
  const objects = useSceneStore((s) => s.objects);
  const reorder = useSceneStore((s) => s.reorder);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = objects.findIndex((o) => o.id === active.id);
    const to = objects.findIndex((o) => o.id === over.id);
    if (from >= 0 && to >= 0) reorder(from, to);
  };

  if (objects.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        No objects yet. Add a primitive above to start comparing.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={objects.map((o) => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-2">
          {objects.map((obj) => (
            <SortableItem key={obj.id} object={obj} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
