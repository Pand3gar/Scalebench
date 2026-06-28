"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LibraryBig } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";

import { EntrySearch } from "@/components/panels/EntrySearch";
import { buttonVariants } from "@/components/ui/button";
import { AddObjectMenu } from "@/components/panels/AddObjectMenu";
import { ObjectListPanel } from "@/components/panels/ObjectListPanel";
import { ObjectDataTable } from "@/components/panels/ObjectDataTable";
import { UnitToggle } from "@/components/panels/UnitToggle";
import { SceneToggles } from "@/components/panels/SceneToggles";
import { ExportDialog } from "@/components/export/ExportDialog";
import { ShareDialog } from "@/components/share/ShareDialog";
import { GridLegend } from "@/components/scene/GridLegend";
import { TinyObjectHint } from "@/components/scene/TinyObjectHint";
import { useLoadFromUrl } from "@/lib/share/useLoadFromUrl";

// three.js must not run on the server.
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

export default function ViewerPage() {
  useLoadFromUrl();

  return (
    <div className="flex h-full flex-col">
      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Left rail */}
        <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-white p-4 max-lg:hidden">
          <div className="flex items-center justify-center pb-4 pt-3">
            <span className="text-xl font-bold tracking-tight text-[#E8623C]">
              ScaleBench
            </span>
          </div>
          <div className="-mt-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <AddObjectMenu />
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Objects
            </h2>
            <ObjectListPanel />
          </div>
          <details className="rounded-lg border border-border">
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Measurement table
            </summary>
            <div className="border-t border-border p-3">
              <ObjectDataTable />
            </div>
          </details>
        </aside>

        {/* Canvas */}
        <main className="relative min-w-0 flex-1">
          <SceneCanvas />
          <GridLegend />
          <TinyObjectHint />

          {/* Floating toolbar */}
          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-2 rounded-[var(--radius)] border border-border bg-white px-4 py-2 shadow-lg">
              <EntrySearch />
              <div className="h-5 w-px bg-border" />
              <Link
                href="/catalog"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <LibraryBig /> Catalog
              </Link>
              <div className="h-5 w-px bg-border" />
              <SceneToggles />
              <div className="h-5 w-px bg-border" />
              <UnitToggle />
              <div className="h-5 w-px bg-border" />
              <ExportDialog />
              <AuthButton />
              <ShareDialog />
            </div>
          </div>

          {/* Mobile rail (basic): floating add controls */}
          <div className="absolute right-3 top-3 lg:hidden">
            <details className="rounded-lg border border-border bg-card/90 p-2 backdrop-blur-sm">
              <summary className="cursor-pointer px-1 text-xs font-semibold text-muted-foreground">
                Objects
              </summary>
              <div className="mt-2 max-h-[70vh] w-72 space-y-4 overflow-y-auto">
                <AddObjectMenu />
                <ObjectListPanel />
              </div>
            </details>
          </div>
        </main>
      </div>
    </div>
  );
}
