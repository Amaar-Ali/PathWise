import { createHmac, timingSafeEqual } from "node:crypto";
import type { PlanId } from "./plan";
import { maxPlan } from "./plan";

const MAX_SKEW_SEC = 60 * 5;

export type PaddleWebhookEvent = {
  event_id?: string;
  event_type?: string;
  occurred_at?: string;
  data?: {
    id?: string;
    status?: string;
    custom_data?: Record<string, unknown> | null;
    items?: Array<{
      price?: { id?: string; billing_cycle?: unknown | null } | null;
      price_id?: string;
      quantity?: number;
    }>;
    details?: {
      line_items?: Array<{ price_id?: string }>;
    };
  };
};

export function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret || !rawBody) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(";").map((part) => {
      const [k, v] = part.trim().split("=");
      return [k ?? "", v ?? ""];
    }),
  );

  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  const skew = Math.abs(Math.floor(Date.now() / 1000) - tsNum);
  if (skew > MAX_SKEW_SEC) return false;

  const signedPayload = `${ts}:${rawBody}`;
  const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(h1, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function getConfiguredPriceIds() {
  const pro = process.env["PADDLE_PRO_PRICE_ID"] || process.env["VITE_PADDLE_PRO_PRICE_ID"] || "";
  const premium =
    process.env["PADDLE_PREMIUM_PRICE_ID"] || process.env["VITE_PADDLE_PREMIUM_PRICE_ID"] || "";
  return { pro, premium };
}

export function planFromPriceId(priceId: string | undefined | null): PlanId | null {
  if (!priceId) return null;
  const { pro, premium } = getConfiguredPriceIds();
  if (premium && priceId === premium) return "premium";
  if (pro && priceId === pro) return "pro";
  return null;
}

export function extractPriceIds(event: PaddleWebhookEvent): string[] {
  const fromItems =
    event.data?.items
      ?.map((item) => item.price?.id || item.price_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0) ?? [];

  if (fromItems.length) return fromItems;

  return (
    event.data?.details?.line_items
      ?.map((item) => item.price_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0) ?? []
  );
}

export function planFromTransaction(event: PaddleWebhookEvent): PlanId | null {
  let plan: PlanId | null = null;
  for (const priceId of extractPriceIds(event)) {
    const mapped = planFromPriceId(priceId);
    if (mapped) plan = plan ? maxPlan(plan, mapped) : mapped;
  }
  return plan;
}

export function userIdFromCustomData(event: PaddleWebhookEvent): string | null {
  const data = event.data?.custom_data;
  if (!data || typeof data !== "object") return null;
  const raw = data["pathwise_user_id"] ?? data["userId"] ?? data["user_id"] ?? data["uid"];
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}
