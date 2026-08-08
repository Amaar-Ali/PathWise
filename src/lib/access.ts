import type { PlanId } from "./plan";
import { hasProAccess } from "./plan";
import { GUEST_DAILY_LIMIT, usageToday } from "./decision-store";

export type AccessContext = {
  signedIn: boolean;
  plan: PlanId;
};

export function canUseHighDetail(ctx: AccessContext): boolean {
  return ctx.signedIn;
}

export function isBlockedByGuestDailyLimit(ctx: AccessContext): boolean {
  if (ctx.signedIn) return false;
  const { used } = usageToday();
  return used >= GUEST_DAILY_LIMIT;
}

export function guestMapsRemaining(): number {
  const { used } = usageToday();
  return Math.max(0, GUEST_DAILY_LIMIT - used);
}

export function allowanceLabel(ctx: AccessContext): string {
  if (!ctx.signedIn) {
    const left = guestMapsRemaining();
    return left > 0
      ? `Guest mode · ${left} decision left today`
      : "You've used today's guest decision — explore saved ones, or sign in.";
  }
  if (ctx.plan === "premium") return "Premium · unlimited maps";
  if (hasProAccess(ctx.plan)) return "Pro · expanded monthly allowance";
  return "Free account · high detail unlocked";
}
