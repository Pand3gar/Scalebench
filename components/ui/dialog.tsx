"use client";

// Lightweight modal built on the native <dialog> element, which provides focus
// trapping and Esc-to-close for free (satisfies the a11y requirement in §7.10
// without pulling in Radix for Phase 0).
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes.
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[min(92vw,32rem)] rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/60",
        className,
      )}
    >
      <div className="flex items-start justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close dialog"
          className="-mr-2 -mt-1"
        >
          <X />
        </Button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}
