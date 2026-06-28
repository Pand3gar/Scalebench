"use client";

// Read-only viewer for a persisted scene (used by /s/[id] and /embed/[id]).
// Loads the scene by id into the store and renders the canvas; no editing panels.
import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Ruler } from "lucide-react";

import { GridLegend } from "@/components/scene/GridLegend";
import { UnitToggle } from "@/components/panels/UnitToggle";
import { useSceneStore } from "@/lib/store/useSceneStore";
import { SceneSchema } from "@/lib/schema/scene";

const SceneCanvas = dynamic(
  () => import("@/components/scene/SceneCanvas").then((m) => m.SceneCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading 3D scene…
      </div>
    ),
  },
);

export function SceneViewer({
  id,
  embed = false,
}: {
  id: string;
  embed?: boolean;
}) {
  const loadScene = useSceneStore((s) => s.loadScene);
  const [status, setStatus] = React.useState<"loading" | "ok" | "error">(
    "loading",
  );

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/scenes?id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error("not found");
        const { scene } = await res.json();
        const parsed = SceneSchema.parse(scene);
        if (cancelled) return;
        loadScene(parsed);
        setStatus("ok");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, loadScene]);

  if (status === "error") {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        This comparison could not be found.
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {!embed ? (
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Ruler className="size-5 text-primary" />
            ScaleBench
          </Link>
          <span className="text-xs text-muted-foreground">Shared comparison</span>
          <div className="ml-auto flex items-center gap-2">
            <UnitToggle />
            <Link
              href="/"
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-secondary"
            >
              Open editor
            </Link>
          </div>
        </header>
      ) : null}

      <main className="relative min-h-0 flex-1">
        {status === "ok" ? <SceneCanvas /> : null}
        <GridLegend />
        {embed ? (
          <Link
            href="/"
            target="_blank"
            className="absolute bottom-3 right-3 rounded-md border border-border bg-card/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur-sm hover:text-foreground"
          >
            Made with ScaleBench
          </Link>
        ) : null}
      </main>
    </div>
  );
}
