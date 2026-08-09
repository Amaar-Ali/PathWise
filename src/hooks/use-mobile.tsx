import * as React from "react";

const MOBILE_BREAKPOINT = 768;
/** Matches Tailwind `lg` — workspace map stacks below this. */
const LG_BREAKPOINT = 1024;

function useMatchMaxWidth(maxWidth: number) {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [maxWidth]);

  return !!matches;
}

export function useIsMobile() {
  return useMatchMaxWidth(MOBILE_BREAKPOINT);
}

/** True below `lg` (1024px) — map workspace mobile shell. */
export function useIsMaxLg() {
  return useMatchMaxWidth(LG_BREAKPOINT);
}
