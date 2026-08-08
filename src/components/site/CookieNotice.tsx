import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "pathwise.cookieNotice";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY) === "1") return;
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie and privacy notice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 px-4 py-3.5 shadow-[0_-8px_30px_-18px_oklch(0.3_0.02_60_/_35%)] backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          PathWise uses essential browser storage for your decisions and may use Firebase Analytics
          to understand usage. See our{" "}
          <Link to="/cookies" className="text-foreground underline-offset-4 hover:underline">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-foreground underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full border border-border bg-foreground px-4 py-1.5 text-[12.5px] font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
