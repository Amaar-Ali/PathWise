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

const H_GAP = 44;
const V_GAP = 220;
export const NODE_W = 224;
export const NODE_H = 64;

export function layoutTree(
  root: DecisionNode,
  isOpen: (n: DecisionNode, depth: number) => boolean,
): LayoutResult {
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
      y: depth * V_GAP,
      parentId: parent?.id,
      hasHiddenChildren: kids.length > 0 && !open,
    };

    if (open) {
      const children = kids.map((k) => place(k, depth + 1, laid));
      laid.x = (children[0]!.x + children[children.length - 1]!.x) / 2;
      children.forEach((c) => edges.push({ id: `${node.id}->${c.id}`, from: laid, to: c }));
    } else {
      laid.x = cursor;
      cursor += NODE_W + H_GAP;
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
      minX: Math.min(...xs) - NODE_W,
      maxX: Math.max(...xs) + NODE_W,
      minY: Math.min(...ys) - NODE_H,
      maxY: Math.max(...ys) + NODE_H * 2,
    },
  };
}

export function edgePath(from: LaidOutNode, to: LaidOutNode) {
  const x1 = from.x;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x;
  const y2 = to.y - NODE_H / 2;
  const my = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
}
