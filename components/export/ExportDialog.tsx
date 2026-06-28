"use client";

// PNG export of the WebGL view. Captures the renderer's drawing buffer directly
// (DOM-snapshot tools cannot capture WebGL). See implementation.md §7.7.
import * as React from "react";
import { Download, ImageDown } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { glHandles } from "@/lib/scene/glRef";
import { captureScene, downloadDataUrl } from "@/lib/share/snapshot";

export function ExportDialog() {
  const [open, setOpen] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);

  const capture = React.useCallback(() => {
    const { gl, scene, camera } = glHandles;
    if (!gl || !scene || !camera) return;
    setPreview(captureScene(gl, scene, camera));
  }, []);

  React.useEffect(() => {
    if (open) capture();
    else setPreview(null);
  }, [open, capture]);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <ImageDown /> Export
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Export image"
        description="A PNG snapshot of the current 3D view."
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-border bg-black/40">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Scene preview" className="w-full" />
            ) : (
              <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
                Rendering…
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={capture}>
              Re-capture
            </Button>
            <Button
              size="sm"
              disabled={!preview}
              onClick={() =>
                preview &&
                downloadDataUrl(preview, `scalebench-${Date.now()}.png`)
              }
            >
              <Download /> Download PNG
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
