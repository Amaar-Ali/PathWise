import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ensureUserProfile, fetchUserPlan, subscribeUserPlan } from "@/lib/user-profile";
import { hasPremiumAccess, hasProAccess, type PlanId } from "@/lib/plan";

type UsePlanResult = {
  plan: PlanId;
  loading: boolean;
  isPro: boolean;
  isPremium: boolean;
  refreshPlan: () => Promise<PlanId>;
};

export function usePlan(): UsePlanResult {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<PlanId>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setPlan("free");
      setLoading(false);
      return;
    }

    let unsub = () => {};
    let cancelled = false;

    setLoading(true);
    void (async () => {
      try {
        await ensureUserProfile(user);
      } catch (err) {
        console.warn("[usePlan] ensure profile failed", err);
      }
      if (cancelled) return;
      unsub = subscribeUserPlan(
        user.uid,
        (next) => {
          if (!cancelled) {
            setPlan(next);
            setLoading(false);
          }
        },
        () => {
          if (!cancelled) setLoading(false);
        },
      );
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, [user, authLoading]);

  return {
    plan,
    loading: authLoading || loading,
    isPro: hasProAccess(plan),
    isPremium: hasPremiumAccess(plan),
    async refreshPlan() {
      if (!user) {
        setPlan("free");
        return "free";
      }
      const next = await fetchUserPlan(user.uid);
      setPlan(next);
      return next;
    },
  };
}
