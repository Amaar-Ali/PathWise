import { createFileRoute } from "@tanstack/react-router";
import {
  extractPriceIds,
  planFromTransaction,
  userIdFromCustomData,
  verifyPaddleSignature,
  type PaddleWebhookEvent,
} from "@/lib/paddle.server";

export const Route = createFileRoute("/api/webhooks/paddle")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PADDLE_WEBHOOK_SECRET"]?.trim() ?? "";
        if (!secret) {
          console.error("[paddle webhook] PADDLE_WEBHOOK_SECRET missing");
          return Response.json({ error: "Webhook not configured" }, { status: 500 });
        }

        const rawBody = await request.text();
        const signature = request.headers.get("paddle-signature");

        if (!verifyPaddleSignature(rawBody, signature, secret)) {
          console.warn("[paddle webhook] invalid signature");
          return Response.json({ error: "Invalid signature" }, { status: 401 });
        }

        let event: PaddleWebhookEvent;
        try {
          event = JSON.parse(rawBody) as PaddleWebhookEvent;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        if (event.event_type !== "transaction.completed") {
          return Response.json({ ok: true, ignored: event.event_type ?? "unknown" });
        }

        const transactionId = event.data?.id;
        if (!transactionId) {
          return Response.json({ error: "Missing transaction id" }, { status: 400 });
        }

        const userId = userIdFromCustomData(event);
        if (!userId) {
          console.error("[paddle webhook] missing pathwise_user_id in custom_data", transactionId);
          return Response.json({ error: "Missing user mapping" }, { status: 400 });
        }

        const plan = planFromTransaction(event);
        if (!plan || plan === "free") {
          console.error(
            "[paddle webhook] unknown price id(s)",
            extractPriceIds(event),
            transactionId,
          );
          return Response.json({ error: "Unknown price" }, { status: 400 });
        }

        const priceIds = extractPriceIds(event);
        const priceId = priceIds[0] ?? null;

        try {
          // Lazy-load Admin SDK so homepage SSR never pulls in firebase-admin
          // (bundled ESM breaks __dirname on Vercel).
          const { applyOneTimePurchase } = await import("@/lib/firebase-admin.server");
          const result = await applyOneTimePurchase({
            userId,
            plan,
            transactionId,
            priceId,
            eventId: event.event_id ?? null,
            occurredAt: event.occurred_at ?? null,
          });

          return Response.json({
            ok: true,
            applied: result.applied,
            plan: result.plan,
            reason: result.reason ?? null,
          });
        } catch (err) {
          console.error("[paddle webhook] apply failed", err);
          return Response.json({ error: "Apply failed" }, { status: 500 });
        }
      },
    },
  },
});
