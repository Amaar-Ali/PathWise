export type PlanId = "free" | "pro" | "premium";

const RANK: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  premium: 2,
};

export function planRank(plan: PlanId): number {
  return RANK[plan] ?? 0;
}

export function maxPlan(a: PlanId, b: PlanId): PlanId {
  return planRank(a) >= planRank(b) ? a : b;
}

export function hasProAccess(plan: PlanId): boolean {
  return planRank(plan) >= planRank("pro");
}

export function hasPremiumAccess(plan: PlanId): boolean {
  return plan === "premium";
}

export function isPaidPlan(plan: PlanId): plan is "pro" | "premium" {
  return plan === "pro" || plan === "premium";
}

export type UserProfile = {
  plan: PlanId;
  email?: string | null;
  displayName?: string | null;
  createdAt?: number;
  updatedAt?: number;
  lastPurchaseAt?: number;
  lastPaddleTransactionId?: string | null;
};

export function normalizePlan(value: unknown): PlanId {
  if (value === "pro" || value === "premium" || value === "free") return value;
  return "free";
}
