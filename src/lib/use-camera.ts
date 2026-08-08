import { useCallback, useEffect, useRef, useState } from "react";

export interface Camera {
  x: number;
  y: number;
  k: number;
}

const MIN_K = 0.32;
const MAX_K = 2.4;

export const clampK = (k: number) => Math.min(MAX_K, Math.max(MIN_K, k));

export function useCamera(initial: Camera = { x: 0, y: 0, k: 1 }) {
  const [camera, setCamera] = useState<Camera>(initial);
  const target = useRef<Camera>(initial);
  const current = useRef<Camera>(initial);
  const raf = useRef<number | null>(null);
  const dragging = useRef(false);

  const tick = useCallback(() => {
    const c = current.current;
    const t = target.current;
    const ease = 0.16;
    const nx = c.x + (t.x - c.x) * ease;
    const ny = c.y + (t.y - c.y) * ease;
    const nk = c.k + (t.k - c.k) * ease;
    const done =
      Math.abs(t.x - nx) < 0.15 && Math.abs(t.y - ny) < 0.15 && Math.abs(t.k - nk) < 0.0008;
    current.current = done ? { ...t } : { x: nx, y: ny, k: nk };
    setCamera(current.current);
    raf.current = done ? null : requestAnimationFrame(tick);
  }, []);

  const kick = useCallback(() => {
    if (raf.current == null) raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const moveTo = useCallback(
    (next: Partial<Camera>, immediate = false) => {
      target.current = { ...target.current, ...next };
      if (immediate) {
        current.current = { ...target.current };
        setCamera(current.current);
        return;
      }
      kick();
    },
    [kick],
  );

  const panBy = useCallback((dx: number, dy: number) => {
    target.current = { ...target.current, x: target.current.x + dx, y: target.current.y + dy };
    current.current = { ...target.current };
    setCamera(current.current);
  }, []);

  const zoomAt = useCallback((px: number, py: number, factor: number) => {
    const t = target.current;
    const k = clampK(t.k * factor);
    const ratio = k / t.k;
    target.current = { k, x: px - (px - t.x) * ratio, y: py - (py - t.y) * ratio };
    current.current = { ...target.current };
    setCamera(current.current);
  }, []);

  useEffect(
    () => () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    },
    [],
  );

  return { camera, moveTo, panBy, zoomAt, dragging, targetRef: target };
}

export function useWheelZoom(
  ref: React.RefObject<HTMLElement | null>,
  handler: (e: WheelEvent) => void,
) {
  const cb = useRef(handler);
  cb.current = handler;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cb.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ref]);
}

export function normalizedDelta(e: WheelEvent) {
  return e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
}
