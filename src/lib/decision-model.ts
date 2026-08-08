export type NodeKind = "root" | "path" | "consequence" | "decision" | "outcome" | "tradeoff";
export type Risk = "low" | "medium" | "high";

export interface DecisionNode {
  id: string;
  label: string;
  kind: NodeKind;
  summary?: string;
  why?: string;
  upside?: string;
  tradeoff?: string;
  watch?: string;
  next?: string;
  pros?: string[];
  cons?: string[];
  risk?: Risk;
  scores?: Record<string, number>;
  timeline?: { label: string; when: string }[];
  strongerWhen?: string[];
  weakerWhen?: string[];
  children?: DecisionNode[];
}

export interface Insight {
  text: string;
  emphasis?: boolean;
}

export interface Recommendation {
  pathId: string;
  lean: string;
  why: string;
  downside: string;
  uncertain: string;
  couldChange: string;
}

export interface Assumption {
  id: string;
  label: string;
  hint?: string;
}

export interface DecisionDoc {
  id: string;
  title: string;
  question: string;
  depth: "medium" | "high";
  context: { label: string; value: string }[];
  criteria: string[];
  root: DecisionNode;
  insights: Insight[];
  recommendation: Recommendation;
  assumptions: Assumption[];
  createdAt: number;
  updatedAt: number;
}

export function walk(
  node: DecisionNode,
  fn: (n: DecisionNode, depth: number, parent?: DecisionNode) => void,
  depth = 0,
  parent?: DecisionNode,
) {
  fn(node, depth, parent);
  node.children?.forEach((c) => walk(c, fn, depth + 1, node));
}

export function flatten(root: DecisionNode) {
  const out: { node: DecisionNode; depth: number; parentId?: string | undefined }[] = [];
  walk(root, (node, depth, parent) => out.push({ node, depth, parentId: parent?.id }));
  return out;
}

export function findNode(root: DecisionNode, id: string): DecisionNode | undefined {
  let found: DecisionNode | undefined;
  walk(root, (n) => {
    if (n.id === id) found = n;
  });
  return found;
}

export function pathToNode(root: DecisionNode, id: string): DecisionNode[] {
  const trail: DecisionNode[] = [];
  const dig = (n: DecisionNode, acc: DecisionNode[]): boolean => {
    const next = [...acc, n];
    if (n.id === id) {
      trail.push(...next);
      return true;
    }
    return (n.children ?? []).some((c) => dig(c, next));
  };
  dig(root, []);
  return trail;
}

export function majorPaths(doc: DecisionDoc) {
  return doc.root.children ?? [];
}

export function subtreeIds(node: DecisionNode): string[] {
  const ids: string[] = [];
  walk(node, (n) => ids.push(n.id));
  return ids;
}

export function collectTimeline(node: DecisionNode) {
  const events: { label: string; when: string; nodeId: string }[] = [];
  walk(node, (n) => n.timeline?.forEach((t) => events.push({ ...t, nodeId: n.id })));
  return events;
}
