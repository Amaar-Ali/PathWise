import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { useAuth } from "@/hooks/use-auth";

export function AuthControls() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <div className="pw-float__cta-skel" aria-hidden />;
  }

  if (!user) {
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className="pw-float__cta">
          Sign in
        </button>
        <SignInDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  const label = user.displayName || user.email || "Account";
  const initials = (user.displayName || user.email || "?")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="pw-float__account" aria-label="Account menu">
          <Avatar className="h-7 w-7">
            {user.photoURL ? <AvatarImage src={user.photoURL} alt="" /> : null}
            <AvatarFallback className="pw-float__avatar-fallback">{initials}</AvatarFallback>
          </Avatar>
          <span className="pw-float__account-label">{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {user.displayName || "Signed in"}
            </span>
            {user.email ? (
              <span className="text-xs text-muted-foreground">{user.email}</span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void signOut();
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
