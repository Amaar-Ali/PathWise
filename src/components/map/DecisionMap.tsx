import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Crosshair, ChevronDown } from "lucide-react";
import type { DecisionNode } from "@/lib/decision-model";
import { pathToNode, subtreeIds } from "@/lib/decision-model";
import { NODE_H, NODE_W, edgePath, layoutTree } from "@/lib/tree-layout";
import { clampK, normalizedDelta, useCamera, useWheelZoom } from "@/lib/use-camera";
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const { camera, moveTo, panBy, zoomAt, targetRef } = useCamera({
    x: 0,
    y: 0,
    k: compact ? 0.62 : 0.8,
  });

  const detailLevel = camera.k < 0.7 ? 1 : camera.k < 1.15 ? 2 : 3;
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

  const { nodes, edges, bounds } = useMemo(() => layoutTree(root, isOpen), [root, isOpen]);
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const fit = useCallback(
    (immediate = false) => {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const bw = bounds.maxX - bounds.minX || 1;
      const bh = bounds.maxY - bounds.minY || 1;
      const k = clampK(Math.min((w - 80) / bw, (h - 80) / bh, compact ? 0.72 : 0.95));
      moveTo(
        {
          k,
          x: w / 2 - ((bounds.minX + bounds.maxX) / 2) * k,
          y: h / 2 - ((bounds.minY + bounds.maxY) / 2) * k,
        },
        immediate,
      );
    },
    [bounds, compact, moveTo],
  );

  const framed = useRef(false);
  useEffect(() => {
    if (framed.current) return;
    framed.current = true;
    fit(true);
  }, [fit]);

  useEffect(() => {
    if (!selectedId) return;
    const el = containerRef.current;
    const target = nodeById.get(selectedId);
    if (!el || !target) return;
    const k = clampK(Math.max(targetRef.current.k, 1.05));
    moveTo({ k, x: el.clientWidth / 2 - target.x * k, y: el.clientHeight * 0.42 - target.y * k });
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
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.k})`}>
          {edges.map((e) => {
            const active = activeTrail.includes(e.to.id) && activeTrail.includes(e.from.id);
            const quiet = activeTrail.length > 0 && !active;
            return (
              <path
                key={e.id}
                d={edgePath(e.from, e.to)}
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
                left: n.x - NODE_W / 2,
                top: n.y - NODE_H / 2,
                width: NODE_W,
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
                  "group w-full rounded-lg border bg-card px-3.5 py-3 text-left transition-all duration-300",
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
                  <div className="mb-1 flex items-center gap-2">
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
                      ? "font-display text-[17px]"
                      : n.depth === 1
                        ? "text-[15px] font-semibold"
                        : "text-[13.5px] font-medium",
                  )}
                >
                  {n.node.label}
                </div>
                {detailLevel > 1 && n.node.summary && (
                  <p
                    className={cn(
                      "mt-1.5 text-[12px] leading-relaxed",
                      n.node.kind === "root" ? "text-background/70" : "text-muted-foreground",
                    )}
                  >
                    {n.node.summary}
                  </p>
                )}
                {detailLevel > 2 && n.node.tradeoff && (
                  <p className="mt-2 border-t border-border pt-2 text-[11.5px] leading-relaxed text-muted-foreground">
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
                  className="absolute left-1/2 top-full z-10 mt-1.5 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10.5px] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
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
          className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card/90 p-1 backdrop-blur-sm"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <ToolbarButton onClick={() => zoomButton(1 / 1.25)} label="Zoom out">
            <Minus className="h-4 w-4" />
          </ToolbarButton>
          <span className="w-14 text-center text-[11px] tabular-nums text-muted-foreground">
            {Math.round(camera.k * 100)}%
          </span>
          <ToolbarButton onClick={() => zoomButton(1.25)} label="Zoom in">
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
          >
            <Crosshair className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-6 right-5 rule-label">
        {detailLevel === 1
          ? "Major paths"
          : detailLevel === 2
            ? "Paths + consequences"
            : "Full detail"}
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {children}
    </button>
  );
}
