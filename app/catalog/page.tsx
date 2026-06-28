"use client";

import Link from "next/link";
import { ArrowLeft, Ruler } from "lucide-react";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { buttonVariants } from "@/components/ui/button";

export default function CatalogPage() {
  return (
    <div className="mx-auto h-screen max-w-5xl overflow-y-auto p-6">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to viewer"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft />
        </Link>
        <Ruler className="size-5 text-primary" />
        <h1 className="text-lg font-semibold">Catalog</h1>
        <p className="ml-2 text-sm text-muted-foreground">
          Curated real objects, tagged with true dimensions.
        </p>
      </header>
      <CatalogGrid />
    </div>
  );
}
