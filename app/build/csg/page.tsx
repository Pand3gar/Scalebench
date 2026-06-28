"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Save, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BuilderPreview } from "@/components/builders/BuilderPreview";
import { CsgTreeEditor } from "@/components/builders/csg/CsgTreeEditor";

import { defaultCsgNodes } from "@/lib/builders/csg";
import { buildCsg } from "@/lib/geometry/csg";
import { createCsgObject } from "@/lib/objects/factory";
import { saveModel, listLocalModels, listMyModels, deleteModel, type SavedModel } from "@/lib/models/save";
import { useSceneStore } from "@/lib/store/useSceneStore";
import { formatMm } from "@/lib/engine/units";
import type { CsgNode, Dimensions } from "@/lib/schema/object";

function CsgBuilder() {
  const router = useRouter();
  const params = useSearchParams();
  const addObject = useSceneStore((s) => s.addObject);
  const displayUnit = useSceneStore((s) => s.displayUnit);

  const [name, setName] = React.useState(params.get("name") ?? "");
  const [nodes, setNodes] = React.useState<CsgNode[]>(() => defaultCsgNodes());
  const [saved, setSaved] = React.useState<string | null>(null);
  const [myModels, setMyModels] = React.useState<SavedModel[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    // Instant local list, then upgrade with the merged DB+local list once the
    // network round-trip resolves (signed-in users see their cloud models too).
    setMyModels(listLocalModels("csg"));
    listMyModels("csg").then((models) => {
      if (!cancelled) setMyModels(models);
    });
    return () => {
      cancelled = true;
    };
  }, [saved, refreshKey]);

  const removeModel = async (id: string) => {
    await deleteModel(id);
    setRefreshKey((k) => k + 1);
  };

  // Evaluate the tree (debounced) into geometry + its bounding-box dimensions.
  const [geometry, setGeometry] = React.useState<ReturnType<typeof buildCsg> | null>(null);
  const [dims, setDims] = React.useState<Dimensions>({ width: 1, height: 1, depth: 1 });
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      try {
        const geo = buildCsg({ source: "csg", nodes });
        geo.computeBoundingBox();
        const bb = geo.boundingBox!;
        setGeometry((prev) => {
          prev?.dispose();
          return geo;
        });
        setDims({
          width: Math.max(bb.max.x - bb.min.x, 1e-3),
          height: Math.max(bb.max.y - bb.min.y, 1e-3),
          depth: Math.max(bb.max.z - bb.min.z, 1e-3),
        });
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    }, 120);
    return () => clearTimeout(handle);
  }, [nodes]);

  const addToScene = () => {
    addObject(createCsgObject(name || "CSG object", nodes, dims));
    router.push("/");
  };

  const save = async () => {
    const res = await saveModel({
      name: name || "CSG object",
      source: "csg",
      shapeDef: { source: "csg", nodes },
      dimensions: dims,
    });
    setSaved(res.persisted);
  };

  const loadModel = (m: SavedModel) => {
    if (m.shapeDef.source !== "csg") return;
    setName(m.name);
    setNodes(m.shapeDef.nodes);
  };

  return (
    <div className="grid h-screen grid-rows-[auto_1fr] lg:grid-cols-[1fr_4fr] lg:grid-rows-1">
      <div className="flex flex-col gap-4 overflow-y-auto border-b border-border p-5 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Back">
            <ArrowLeft />
          </Link>
          <h1 className="text-lg font-semibold">Build: CSG assembly</h1>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Game controller" />
        </div>

        <CsgTreeEditor nodes={nodes} onChange={setNodes} />

        {error ? <p className="text-xs text-destructive">CSG error: {error}</p> : null}

        <div className="rounded-md border border-border bg-secondary/30 p-2 text-xs text-muted-foreground">
          Calibrated size:{" "}
          <span className="tabular-nums text-foreground">
            {formatMm(dims.width, displayUnit)} × {formatMm(dims.height, displayUnit)} ×{" "}
            {formatMm(dims.depth, displayUnit)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={addToScene}>
            <Plus /> Add to scene
          </Button>
          <Button variant="outline" onClick={save}>
            <Save /> Save model
          </Button>
          {saved ? (
            <span className="text-xs text-muted-foreground">
              Saved {saved === "db" ? "to your account" : "locally"}.
            </span>
          ) : null}
        </div>

        {myModels.length > 0 ? (
          <div className="text-xs">
            <div className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">
              My CSG builds
            </div>
            <div className="flex flex-wrap gap-1.5">
              {myModels.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center overflow-hidden rounded-md border border-border bg-secondary/30"
                >
                  <button
                    type="button"
                    onClick={() => loadModel(m)}
                    className="px-2 py-1 text-foreground hover:text-primary"
                  >
                    {m.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeModel(m.id)}
                    aria-label={`Delete ${m.name}`}
                    title="Delete"
                    className="px-1.5 py-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="min-h-[40vh] p-5">
        <BuilderPreview geometry={geometry} />
      </div>
    </div>
  );
}

export default function CsgBuilderPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <CsgBuilder />
    </React.Suspense>
  );
}
