import type { DecisionNode } from "./decision-model";

export interface LaidOutNode {
  node: DecisionNode;
  id: string;
  depth: number;
  x: number;
  y: number;
  parentId?: string | undefined;
  hasHiddenChildren: boolean;
}

export interface Edge {
  id: string;
  from: LaidOutNode;
  to: LaidOutNode;
}

export interface LayoutResult {
  nodes: LaidOutNode[];
  edges: Edge[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export interface LayoutOptions {
  nodeW?: number;
  nodeH?: number;
  hGap?: number;
  vGap?: number;
}

const H_GAP = 44;
const V_GAP = 220;
export const NODE_W = 224;
export const NODE_H = 64;

/** Mobile-only denser cards — desktop keeps NODE_W / NODE_H. */
export const MOBILE_NODE_W = 168;
export const MOBILE_NODE_H = 58;
export const MOBILE_H_GAP = 28;
export const MOBILE_V_GAP = 168;

export function layoutTree(
  root: DecisionNode,
  isOpen: (n: DecisionNode, depth: number) => boolean,
  opts: LayoutOptions = {},
): LayoutResult {
  const nodeW = opts.nodeW ?? NODE_W;
  const nodeH = opts.nodeH ?? NODE_H;
  const hGap = opts.hGap ?? H_GAP;
  const vGap = opts.vGap ?? V_GAP;

  const nodes: LaidOutNode[] = [];
  const edges: Edge[] = [];
  let cursor = 0;

  const place = (node: DecisionNode, depth: number, parent?: LaidOutNode): LaidOutNode => {
    const kids = node.children ?? [];
    const open = kids.length > 0 && isOpen(node, depth);
    const laid: LaidOutNode = {
      node,
      id: node.id,
      depth,
      x: 0,
      y: depth * vGap,
      parentId: parent?.id,
      hasHiddenChildren: kids.length > 0 && !open,
    };

    if (open) {
      const children = kids.map((k) => place(k, depth + 1, laid));
      laid.x = (children[0]!.x + children[children.length - 1]!.x) / 2;
      children.forEach((c) => edges.push({ id: `${node.id}->${c.id}`, from: laid, to: c }));
    } else {
      laid.x = cursor;
      cursor += nodeW + hGap;
    }
    nodes.push(laid);
    return laid;
  };

  place(root, 0);

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  return {
    nodes,
    edges,
    bounds: {
      minX: Math.min(...xs) - nodeW,
      maxX: Math.max(...xs) + nodeW,
      minY: Math.min(...ys) - nodeH,
      maxY: Math.max(...ys) + nodeH * 2,
    },
  };
}

export function edgePath(
  from: LaidOutNode,
  to: LaidOutNode,
  nodeH: number = NODE_H,
) {
  const x1 = from.x;
  const y1 = from.y + nodeH / 2;
  const x2 = to.x;
  const y2 = to.y - nodeH / 2;
  const my = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
}
