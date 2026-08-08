import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import type { PlanId } from "./plan";
import { maxPlan, normalizePlan } from "./plan";

let app: App | null = null;

function parseServiceAccount() {
  const raw = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
  if (!raw?.trim()) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_JSON (server-only Firebase Admin service account JSON).",
    );
  }
  const parsed = JSON.parse(raw) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing client_email/private_key.");
  }
  const projectId = parsed.project_id || process.env["VITE_FIREBASE_PROJECT_ID"];
  if (!projectId) {
    throw new Error("Missing Firebase project id for Admin SDK.");
  }
  return {
    projectId,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

export function getAdminApp(): App {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }
  const sa = parseServiceAccount();
  app = initializeApp({
    credential: cert({
      projectId: sa.projectId,
      clientEmail: sa.clientEmail,
      privateKey: sa.privateKey,
    }),
    projectId: sa.projectId,
  });
  return app;
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export type ApplyPurchaseInput = {
  userId: string;
  plan: "pro" | "premium";
  transactionId: string;
  priceId: string | null;
  eventId?: string | null;
  occurredAt?: string | null;
};

export async function applyOneTimePurchase(input: ApplyPurchaseInput): Promise<{
  applied: boolean;
  plan: PlanId;
  reason?: string;
}> {
  const db = getAdminDb();
  const purchaseRef = db.collection("purchases").doc(input.transactionId);
  const userRef = db.collection("users").doc(input.userId);

  return db.runTransaction(async (tx) => {
    const purchaseSnap = await tx.get(purchaseRef);
    if (purchaseSnap.exists) {
      const existing = purchaseSnap.data();
      return {
        applied: false,
        plan: normalizePlan(existing?.["plan"]),
        reason: "already_applied",
      };
    }

    const userSnap = await tx.get(userRef);
    const userData = userSnap.data();
    const current = normalizePlan(userData?.["plan"]);
    const next = maxPlan(current, input.plan);
    const now = Date.now();
    const createdAt = typeof userData?.["createdAt"] === "number" ? userData["createdAt"] : now;

    tx.set(purchaseRef, {
      userId: input.userId,
      plan: input.plan,
      status: "completed",
      paddleTransactionId: input.transactionId,
      paddlePriceId: input.priceId,
      paddleEventId: input.eventId ?? null,
      occurredAt: input.occurredAt ?? null,
      createdAt: now,
    });

    tx.set(
      userRef,
      {
        plan: next,
        updatedAt: now,
        lastPurchaseAt: now,
        lastPaddleTransactionId: input.transactionId,
        createdAt,
      },
      { merge: true },
    );

    return { applied: true, plan: next };
  });
}
