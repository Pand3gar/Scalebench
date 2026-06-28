"use client";

// Auth button for the top bar: shows avatar/email when signed in, or opens a
// magic-link sign-in dialog when signed out. Falls back to nothing when Supabase
// is unconfigured (dev mode). See implementation.md §7.12.
import * as React from "react";
import { LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";

function SignInDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset state whenever the dialog opens.
  React.useEffect(() => {
    if (open) {
      setEmail("");
      setSent(false);
      setError(null);
    }
  }, [open]);

  const sendMagicLink = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Sign in to ScaleBench"
      description="Enter your email and we'll send you a magic link — no password needed."
    >
      {sent ? (
        <div className="space-y-2 py-2 text-sm">
          <p className="font-medium text-primary">✓ Check your inbox!</p>
          <p className="text-muted-foreground">
            We sent a sign-in link to <span className="font-mono">{email}</span>.
            Click it to continue — you can close this dialog.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="auth-email">Email address</Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMagicLink();
              }}
              autoFocus
            />
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <Button
            className="w-full"
            onClick={sendMagicLink}
            disabled={busy || !email}
          >
            <LogIn className="size-4" />
            {busy ? "Sending…" : "Send magic link"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Signed-in users can save models to the database.
            Anonymous use is always free — builds are saved locally.
          </p>
        </div>
      )}
    </Dialog>
  );
}

export function AuthButton() {
  const { user, loading } = useAuth();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Don't render at all if Supabase isn't configured (pure dev / seed mode).
  if (!isSupabaseConfigured) return null;
  if (loading) return null;

  if (user) {
    const label = user.email ?? "Account";
    const initial = label[0].toUpperCase();
    return (
      <div className="flex items-center gap-2">
        <span
          className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          title={label}
          aria-label={`Signed in as ${label}`}
        >
          {initial}
        </span>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Sign out"
          onClick={async () => {
            const supabase = getSupabaseBrowserClient();
            if (supabase) await supabase.auth.signOut();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
        <User className="size-4" />
        Sign in
      </Button>
      <SignInDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
