"use client";

// Toggle for dimension labels.
import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSceneStore } from "@/lib/store/useSceneStore";

export function SceneToggles() {
  const showLabels = useSceneStore((s) => s.showLabels);
  const toggleLabels = useSceneStore((s) => s.toggleLabels);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={showLabels ? "default" : "ghost"}
        size="sm"
        aria-pressed={showLabels}
        onClick={toggleLabels}
      >
        <Ruler /> Labels
      </Button>
    </div>
  );
}
