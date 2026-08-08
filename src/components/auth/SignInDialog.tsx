import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PathMark } from "@/components/site/PathMark";
import { authErrorMessage, useAuth } from "@/hooks/use-auth";

type Mode = "signin" | "signup";

type SignInDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onOpenChange(false);
      setEmail("");
      setPassword("");
      setMode("signin");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "signin") {
      void run(() => signInWithEmail(email.trim(), password));
    } else {
      void run(() => signUpWithEmail(email.trim(), password));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] gap-0 overflow-hidden border-border/80 bg-card p-0 shadow-[var(--shadow-panel)] sm:rounded-xl">
        <div className="border-b border-border/70 bg-surface px-6 py-5">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <PathMark className="h-4 w-4" />
              <span className="text-[12px] font-semibold tracking-[0.18em] uppercase">
                PathWise
              </span>
            </div>
            <DialogTitle className="font-display text-[1.65rem] font-light leading-tight tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </DialogTitle>
            <DialogDescription className="text-[14px] leading-relaxed text-muted-foreground">
              {mode === "signin"
                ? "Sign in to keep your decision maps across devices."
                : "Save paths as you explore — no credit card, just an account."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 py-5">
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => signInWithGoogle())}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-border bg-background px-4 py-2.5 text-[13.5px] font-medium transition-colors hover:border-border-strong disabled:opacity-50"
          >
            <GoogleMark />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-[12.5px] text-muted-foreground">
                Email
              </Label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-lg bg-background"
                placeholder="you@example.com"
                disabled={busy}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="auth-password" className="text-[12.5px] text-muted-foreground">
                Password
              </Label>
              <Input
                id="auth-password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-lg bg-background"
                placeholder="At least 6 characters"
                disabled={busy}
              />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-[14px] font-medium text-background transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-[13px] text-muted-foreground">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  className="text-foreground underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have one?{" "}
                <button
                  type="button"
                  className="text-foreground underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
