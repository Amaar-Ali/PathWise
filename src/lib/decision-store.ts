import type { DecisionDoc } from "./decision-model";

const KEY = "pathwise.decisions";
const USAGE = "pathwise.usage";

const isBrowser = () => typeof window !== "undefined";

export function loadDecisions(): DecisionDoc[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DecisionDoc[]) : [];
  } catch {
    return [];
  }
}

export function loadDecision(id: string) {
  return loadDecisions().find((d) => d.id === id);
}

export function saveDecision(doc: DecisionDoc) {
  if (!isBrowser()) return;
  const all = loadDecisions().filter((d) => d.id !== doc.id);
  window.localStorage.setItem(
    KEY,
    JSON.stringify([{ ...doc, updatedAt: Date.now() }, ...all].slice(0, 40)),
  );
}

export function deleteDecision(id: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(loadDecisions().filter((d) => d.id !== id)));
}

export function usageToday() {
  if (!isBrowser()) return { used: 0, day: "" };
  const day = new Date().toISOString().slice(0, 10);
  try {
    const raw = JSON.parse(window.localStorage.getItem(USAGE) ?? "{}") as {
      day?: string;
      used?: number;
    };
    return raw.day === day ? { used: raw.used ?? 0, day } : { used: 0, day };
  } catch {
    return { used: 0, day };
  }
}

export function recordUsage() {
  if (!isBrowser()) return;
  const { used, day } = usageToday();
  window.localStorage.setItem(USAGE, JSON.stringify({ day, used: used + 1 }));
}

export const GUEST_DAILY_LIMIT = 1;
