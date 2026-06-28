"use client";

// Sharing: (a) stateless lz-string URL links for small scenes, (b) DB-backed short
// IDs for larger/saved scenes, plus a read-only embed snippet. See §7.8.
import * as React from "react";
import { Check, Copy, Share2, Link2, Code2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSceneStore } from "@/lib/store/useSceneStore";
import { encodeScene, isStatelessable } from "@/lib/share/encode";
import { persistScene, sceneUrl, embedSnippet } from "@/lib/share/persist";
import type { Scene } from "@/lib/schema/scene";

function buildScene(): Scene {
  const s = useSceneStore.getState();
  return {
    version: 1,
    displayUnit: s.displayUnit,
    objects: s.objects,
    showLabels: s.showLabels,
    camera: s.camera ?? undefined,
  };
}

function CopyRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon} {label}
      </div>
      <div className="flex gap-2">
        <Input readOnly value={value} onFocus={(e) => e.target.select()} />
        <Button
          size="sm"
          className="shrink-0"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

export function ShareDialog() {
  const [open, setOpen] = React.useState(false);
  const [statelessUrl, setStatelessUrl] = React.useState<string | null>(null);
  const [persistedId, setPersistedId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const objectCount = useSceneStore((s) => s.objects.length);

  React.useEffect(() => {
    if (!open) {
      setStatelessUrl(null);
      setPersistedId(null);
      setError(null);
      return;
    }
    const scene = buildScene();
    if (isStatelessable(scene)) {
      setStatelessUrl(`${window.location.origin}/?d=${encodeScene(scene)}`);
    } else {
      setStatelessUrl(null);
    }
  }, [open]);

  const createPersisted = async () => {
    setBusy(true);
    setError(null);
    try {
      const id = await persistScene(buildScene());
      setPersistedId(id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} disabled={objectCount === 0}>
        <Share2 /> Share
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Share comparison"
        description="Anyone with a link sees the exact same scene."
      >
        <div className="space-y-4">
          {statelessUrl ? (
            <CopyRow label="Quick link (no account needed)" value={statelessUrl} icon={<Link2 className="size-3.5" />} />
          ) : (
            <p className="text-xs text-muted-foreground">
              This scene is large; create a saved link below.
            </p>
          )}

          <div className="border-t border-border pt-4">
            {persistedId ? (
              <div className="space-y-4">
                <CopyRow label="Saved link" value={sceneUrl(persistedId)} icon={<Link2 className="size-3.5" />} />
                <CopyRow label="Embed (iframe)" value={embedSnippet(persistedId)} icon={<Code2 className="size-3.5" />} />
              </div>
            ) : (
              <Button size="sm" variant="secondary" onClick={createPersisted} disabled={busy}>
                <Link2 /> {busy ? "Saving…" : "Create saved link + embed"}
              </Button>
            )}
            {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
          </div>
        </div>
      </Dialog>
    </>
  );
}
