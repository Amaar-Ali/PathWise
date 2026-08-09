import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Crosshair, ChevronDown } from "lucide-react";
import type { DecisionNode } from "@/lib/decision-model";
import { pathToNode, subtreeIds } from "@/lib/decision-model";
import {
  MOBILE_H_GAP,
  MOBILE_NODE_H,
  MOBILE_NODE_W,
  MOBILE_V_GAP,
  NODE_H,
  NODE_W,
  edgePath,
  layoutTree,
} from "@/lib/tree-layout";
import { clampK, normalizedDelta, useCamera, useWheelZoom } from "@/lib/use-camera";
import { useIsMaxLg } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Props {
  root: DecisionNode;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  emphasized?: Set<string>;
  dimmed?: Set<string>;
  compact?: boolean;
  className?: string;
  showToolbar?: boolean;
}

export function DecisionMap({
  root,
  selectedId,
  onSelect,
  emphasized,
  dimmed,
  compact = false,
  className,
  showToolbar = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMaxLg = useIsMaxLg();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const { camera, moveTo, panBy, zoomAt, targetRef } = useCamera({
    x: 0,
    y: 0,
    k: compact ? 0.62 : 0.8,
  });

  // Mobile: keep "major paths" longer so the tree stays legible at phone zoom.
  const detailLevel = isMaxLg
    ? camera.k < 0.88 ? 1 : camera.k < 1.28 ? 2 : 3
    : camera.k < 0.7
      ? 1
      : camera.k < 1.15
        ? 2
        : 3;
  const autoDepth = detailLevel === 1 ? 1 : detailLevel === 2 ? 2 : 3;

  const selectedTrail = useMemo(
    () => (selectedId ? pathToNode(root, selectedId).map((n) => n.id) : []),
    [root, selectedId],
  );
  const hoverTrail = useMemo(
    () => (hovered ? pathToNode(root, hovered).map((n) => n.id) : []),
    [root, hovered],
  );
  const selectedSubtree = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const found = pathToNode(root, selectedId).at(-1);
    return new Set(found ? subtreeIds(found) : []);
  }, [root, selectedId]);

  const isOpen = useCallback(
    (n: DecisionNode, depth: number) =>
      depth + 1 <= autoDepth || expanded.has(n.id) || selectedTrail.includes(n.id),
    [autoDepth, expanded, selectedTrail],
  );

  const nodeW = isMaxLg ? MOBILE_NODE_W : NODE_W;
  const nodeH = isMaxLg ? MOBILE_NODE_H : NODE_H;

  const { nodes, edges, bounds } = useMemo(
    () =>
      layoutTree(
        root,
        isOpen,
        isMaxLg
          ? {
              nodeW: MOBILE_NODE_W,
              nodeH: MOBILE_NODE_H,
              hGap: MOBILE_H_GAP,
              vGap: MOBILE_V_GAP,
            }
          : {},
      ),
    [root, isOpen, isMaxLg],
  );
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const fit = useCallback(
    (immediate = false) => {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;

      // Mobile: frame root + major paths at a readable scale.
      // Desktop: unchanged full-bounds fit.
      let minX = bounds.minX;
      let maxX = bounds.maxX;
      let minY = bounds.minY;
      let maxY = bounds.maxY;
      if (isMaxLg) {
        const majors = nodes.filter((n) => n.depth <= 1);
        if (majors.length) {
          const xs = majors.map((n) => n.x);
          const ys = majors.map((n) => n.y);
          minX = Math.min(...xs) - nodeW * 0.5;
          maxX = Math.max(...xs) + nodeW * 0.5;
          minY = Math.min(...ys) - nodeH * 0.65;
          maxY = Math.max(...ys) + nodeH * 1.25;
        }
      }

      const bw = maxX - minX || 1;
      const bh = maxY - minY || 1;
      const padX = isMaxLg ? 20 : 80;
      const padY = isMaxLg ? 80 : 80;
      const maxK = compact ? 0.72 : isMaxLg ? 0.86 : 0.95;
      let k = Math.min((w - padX) / bw, (h - padY) / bh, maxK);
      if (isMaxLg) k = Math.min(Math.max(k, 0.72), 0.86);
      k = clampK(k);
      const cy = isMaxLg ? h * 0.46 : h / 2;
      moveTo(
        {
          k,
          x: w / 2 - ((minX + maxX) / 2) * k,
          y: cy - ((minY + maxY) / 2) * k,
        },
        immediate,
      );
    },
    [bounds, compact, isMaxLg, moveTo, nodeH, nodeW, nodes],
  );

  const framed = useRef(false);
  useEffect(() => {
    if (framed.current) return;
    framed.current = true;
    fit(true);
  }, [fit]);

  // Re-fit when crossing the mobile/desktop shell so padding stays honest.
  const wasMaxLg = useRef(isMaxLg);
  useEffect(() => {
    if (wasMaxLg.current === isMaxLg) return;
    wasMaxLg.current = isMaxLg;
    fit(true);
  }, [isMaxLg, fit]);

  useEffect(() => {
    if (!selectedId) return;
    const el = containerRef.current;
    const target = nodeById.get(selectedId);
    if (!el || !target) return;
    const k = clampK(Math.max(targetRef.current.k, isMaxLg ? 0.95 : 1.05));
    const focusY = isMaxLg ? el.clientHeight * 0.34 : el.clientHeight * 0.42;
    moveTo({ k, x: el.clientWidth / 2 - target.x * k, y: focusY - target.y * k });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useWheelZoom(containerRef, (e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = normalizedDelta(e);
    const intensity = e.ctrlKey ? 0.006 : 0.0018;
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-dy * intensity));
  });

  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-node]")) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    panBy(e.clientX - d.x, e.clientY - d.y);
    d.x = e.clientX;
    d.y = e.clientY;
    d.moved = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) onSelect?.(null);
  };

  const zoomButton = (factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    zoomAt(el.clientWidth / 2, el.clientHeight / 2, factor);
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const activeTrail = selectedTrail.length ? selectedTrail : hoverTrail;
  const detailLabel =
    detailLevel === 1
      ? "Major paths"
      : detailLevel === 2
        ? "Paths + consequences"
        : "Full detail";

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(
        "relative h-full w-full touch-none overflow-hidden bg-background select-none",
        drag.current ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--border-strong) 55%, transparent) 1px, transparent 0)",
        backgroundSize: `${28 * camera.k}px ${28 * camera.k}px`,
        backgroundPosition: `${camera.x}px ${camera.y}px`,
      }}
    >
      {/* Soft scrims — mobile only; clear the tree under chrome */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-background via-background/70 to-transparent max-lg:block lg:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-background via-background/70 to-transparent max-lg:block lg:hidden"
      />

      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.k})`}>
          {edges.map((e) => {
            const active = activeTrail.includes(e.to.id) && activeTrail.includes(e.from.id);
            const quiet = activeTrail.length > 0 && !active;
            return (
              <path
                key={e.id}
                d={edgePath(e.from, e.to, nodeH)}
                fill="none"
                stroke={active ? "var(--accent)" : "var(--border-strong)"}
                strokeWidth={active ? 2.2 : 1.2}
                strokeOpacity={quiet ? 0.35 : 1}
                strokeLinecap="round"
                style={{ transition: "stroke 260ms var(--ease-out-soft), stroke-opacity 260ms" }}
              />
            );
          })}
        </g>
      </svg>

      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.k})`,
          transformOrigin: "0 0",
        }}
      >
        {nodes.map((n) => {
          const isSelected = n.id === selectedId;
          const inTrail = activeTrail.includes(n.id);
          const inSelectedSubtree = selectedSubtree.has(n.id);
          const quiet =
            (activeTrail.length > 0 && !inTrail && !inSelectedSubtree) || dimmed?.has(n.id);
          const lifted = emphasized?.has(n.id);
          return (
            <div
              key={n.id}
              data-node
              className="absolute"
              style={{
                left: n.x - nodeW / 2,
                top: n.y - nodeH / 2,
                width: nodeW,
                transition:
                  "left 420ms var(--ease-out-soft), top 420ms var(--ease-out-soft), opacity 260ms",
                opacity: quiet ? 0.42 : 1,
              }}
            >
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onSelect?.(n.id)}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered((h) => (h === n.id ? null : h))}
                className={cn(
                  "group w-full rounded-lg border bg-card px-3.5 py-3 text-left transition-all duration-300 max-lg:px-2.5 max-lg:py-2",
                  n.node.kind === "root" && "border-foreground/80 bg-foreground text-background",
                  isSelected && n.node.kind !== "root" && "border-accent ring-2 ring-accent/25",
                  !isSelected && n.node.kind !== "root" && inTrail && "border-accent/60",
                  !isSelected &&
                    !inTrail &&
                    n.node.kind !== "root" &&
                    "border-border hover:border-border-strong",
                  lifted && "shadow-[0_0_0_3px_var(--accent-soft)]",
                )}
                style={{ boxShadow: isSelected ? "var(--shadow-panel)" : "var(--shadow-soft)" }}
              >
                {n.node.kind !== "root" && detailLevel > 1 && (
                  <div className="mb-1 flex items-center gap-2 max-lg:mb-0.5">
                    <span className="rule-label">{n.node.kind}</span>
                    {n.node.risk && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: `var(--risk-${n.node.risk})` }}
                        aria-label={`${n.node.risk} risk`}
                      />
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "leading-snug",
                    n.node.kind === "root"
                      ? "font-display text-[17px] max-lg:text-[14.5px]"
                      : n.depth === 1
                        ? "text-[15px] font-semibold max-lg:text-[13px]"
                        : "text-[13.5px] font-medium max-lg:text-[12.5px]",
                  )}
                >
                  {n.node.label}
                </div>
                {detailLevel > 1 && n.node.summary && (
                  <p
                    className={cn(
                      "mt-1.5 text-[12px] leading-relaxed max-lg:mt-1 max-lg:line-clamp-2 max-lg:text-[11px]",
                      n.node.kind === "root" ? "text-background/70" : "text-muted-foreground",
                    )}
                  >
                    {n.node.summary}
                  </p>
                )}
                {detailLevel > 2 && n.node.tradeoff && (
                  <p className="mt-2 border-t border-border pt-2 text-[11.5px] leading-relaxed text-muted-foreground max-lg:mt-1.5 max-lg:line-clamp-2 max-lg:pt-1.5 max-lg:text-[10.5px]">
                    <span className="rule-label mr-1">Tradeoff</span>
                    {n.node.tradeoff}
                  </p>
                )}
              </button>

              {n.hasHiddenChildren && (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => toggle(n.id)}
                  className="absolute left-1/2 top-full z-10 mt-1.5 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10.5px] text-muted-foreground transition-colors hover:border-accent hover:text-accent max-lg:mt-2 max-lg:px-2.5 max-lg:py-1 max-lg:text-[11px]"
                >
                  <ChevronDown className="h-3 w-3" />
                  {n.node.children?.length}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showToolbar && (
        <div
          className={cn(
            "absolute z-[2] flex items-center",
            // Desktop: centered pill (unchanged)
            "bottom-5 left-1/2 -translate-x-1/2 gap-1 rounded-full border border-border bg-card/90 p-1 backdrop-blur-sm",
            // Mobile: full dock — legend + zoom as one calm bar
            "max-lg:inset-x-3 max-lg:bottom-3 max-lg:left-3 max-lg:right-3 max-lg:translate-x-0 max-lg:justify-between max-lg:gap-2 max-lg:rounded-2xl max-lg:border-border/80 max-lg:bg-card/85 max-lg:px-2.5 max-lg:py-1.5 max-lg:shadow-[var(--shadow-panel)]",
          )}
          style={{ boxShadow: isMaxLg ? undefined : "var(--shadow-soft)" }}
        >
          <span className="pointer-events-none hidden min-w-0 truncate px-1.5 rule-label max-lg:block">
            {detailLabel}
          </span>
          <div className="flex items-center gap-1 max-lg:shrink-0">
            <ToolbarButton onClick={() => zoomButton(1 / 1.25)} label="Zoom out" roomy={isMaxLg}>
              <Minus className="h-4 w-4" />
            </ToolbarButton>
            <span className="w-12 text-center text-[11px] tabular-nums text-muted-foreground max-lg:w-11">
              {Math.round(camera.k * 100)}%
            </span>
            <ToolbarButton onClick={() => zoomButton(1.25)} label="Zoom in" roomy={isMaxLg}>
              <Plus className="h-4 w-4" />
            </ToolbarButton>
            <div className="mx-1 h-5 w-px bg-border" />
            <ToolbarButton
              onClick={() => {
                setExpanded(new Set());
                onSelect?.(null);
                fit();
              }}
              label="Back to the decision"
              roomy={isMaxLg}
            >
              <Crosshair className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>
      )}

      {/* Desktop legend only — mobile lives inside the dock */}
      <div className="pointer-events-none absolute bottom-6 right-5 rule-label max-lg:hidden">
        {detailLabel}
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  label,
  roomy = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  roomy?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      className={cn(
        "rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        roomy ? "p-2.5" : "p-1.5",
      )}
    >
      {children}
    </button>
  );
}
