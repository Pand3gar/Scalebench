"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Save, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MmField } from "@/components/builders/MmField";
import { BuilderPreview } from "@/components/builders/BuilderPreview";
import { ProfileEditor } from "@/components/builders/lathe/ProfileEditor";

import {
  LATHE_TEMPLATES,
  DEFAULT_LATHE_TEMPLATE,
  deriveAnchors,
  applyAnchors,
  latheDimensions,
  type LatheAnchors,
} from "@/lib/builders/lathe";
import { buildLathe } from "@/lib/geometry/lathe";
import { createLatheObject } from "@/lib/objects/factory";
import { saveModel, listLocalModels, listMyModels, deleteModel, type SavedModel } from "@/lib/models/save";
import { useSceneStore } from "@/lib/store/useSceneStore";
import { formatMm } from "@/lib/engine/units";
import type { ProfilePoint } from "@/lib/schema/object";

function LatheBuilder() {
  const router = useRouter();
  const params = useSearchParams();
  const addObject = useSceneStore((s) => s.addObject);
  const displayUnit = useSceneStore((s) => s.displayUnit);

  const initialTemplate =
    params.get("template") && LATHE_TEMPLATES[params.get("template")!]
      ? params.get("template")!
      : DEFAULT_LATHE_TEMPLATE;

  const [name, setName] = React.useState(params.get("name") ?? "");
  const [templateId, setTemplateId] = React.useState(initialTemplate);
  const [profile, setProfile] = React.useState<ProfilePoint[]>(
    LATHE_TEMPLATES[initialTemplate].profile,
  );
  const [saved, setSaved] = React.useState<string | null>(null);
  const [myModels, setMyModels] = React.useState<SavedModel[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    // Instant local list, then upgrade with the merged DB+local list once the
    // network round-trip resolves (signed-in users see their cloud models too).
    setMyModels(listLocalModels("lathe"));
    listMyModels("lathe").then((models) => {
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

  const anchors = React.useMemo(() => deriveAnchors(profile), [profile]);

  const geometry = React.useMemo(
    () =>
      buildLathe({
        source: "lathe",
        template: templateId,
        profile,
        segments: 96,
        interpolation: "catmull-rom",
        anchors,
      }),
    [templateId, profile, anchors],
  );
  React.useEffect(() => () => geometry.dispose(), [geometry]);

  const dims = latheDimensions(anchors);

  const setTemplate = (id: string) => {
    setTemplateId(id);
    setProfile(LATHE_TEMPLATES[id].profile);
  };

  const editAnchor = (patch: Partial<LatheAnchors>) => {
    setProfile((prev) => applyAnchors(prev, { ...deriveAnchors(prev), ...patch }));
  };

  const addToScene = () => {
    addObject(createLatheObject(name || LATHE_TEMPLATES[templateId].label, {
      template: templateId,
      profile,
      anchors,
    }));
    router.push("/");
  };

  const save = async () => {
    const res = await saveModel({
      name: name || LATHE_TEMPLATES[templateId].label,
      source: "lathe",
      shapeDef: {
        source: "lathe",
        template: templateId,
        profile,
        segments: 96,
        interpolation: "catmull-rom",
        anchors,
      },
      dimensions: dims,
    });
    setSaved(res.persisted);
  };

  const loadModel = (m: SavedModel) => {
    if (m.shapeDef.source !== "lathe") return;
    setName(m.name);
    setTemplateId(m.shapeDef.template);
    setProfile(m.shapeDef.profile);
  };

  return (
    <div className="grid h-screen grid-rows-[auto_1fr] lg:grid-cols-[1fr_4fr] lg:grid-rows-1">
      {/* Controls */}
      <div className="flex flex-col gap-4 overflow-y-auto border-b border-border p-5 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Back">
            <ArrowLeft />
          </Link>
          <h1 className="text-lg font-semibold">Build: Lathe (revolved)</h1>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Thermos flask"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Template</Label>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(LATHE_TEMPLATES).map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={t.id === templateId ? "default" : "outline"}
                onClick={() => setTemplate(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MmField label="Total height" mm={anchors.totalHeight} onCommit={(v) => editAnchor({ totalHeight: v })} />
          <MmField label="Body diameter" mm={anchors.bodyDiameter} onCommit={(v) => editAnchor({ bodyDiameter: v })} />
          <MmField label="Mouth diameter" mm={anchors.mouthDiameter ?? 0} onCommit={(v) => editAnchor({ mouthDiameter: v })} />
          <MmField label="Base diameter" mm={anchors.baseDiameter ?? 0} onCommit={(v) => editAnchor({ baseDiameter: v })} />
        </div>

        <ProfileEditor profile={profile} onChange={setProfile} />

        <div className="rounded-md border border-border bg-secondary/30 p-2 text-xs text-muted-foreground">
          Calibrated size:{" "}
          <span className="tabular-nums text-foreground">
            ⌀{formatMm(dims.width, displayUnit)} × {formatMm(dims.height, displayUnit)}
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
              My lathe builds
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

      {/* Preview */}
      <div className="min-h-[40vh] p-5">
        <BuilderPreview geometry={geometry} />
      </div>
    </div>
  );
}

export default function LatheBuilderPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <LatheBuilder />
    </React.Suspense>
  );
}
