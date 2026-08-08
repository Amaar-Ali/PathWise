import { doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirestoreDb } from "@/lib/firebase";
import { normalizePlan, type PlanId, type UserProfile } from "@/lib/plan";

const USERS = "users";

function readProfile(data: Record<string, unknown>, user?: User): UserProfile {
  const profile: UserProfile = {
    plan: normalizePlan(data["plan"]),
    email: (typeof data["email"] === "string" ? data["email"] : null) ?? user?.email ?? null,
    displayName:
      (typeof data["displayName"] === "string" ? data["displayName"] : null) ??
      user?.displayName ??
      null,
  };
  if (typeof data["createdAt"] === "number") profile.createdAt = data["createdAt"];
  if (typeof data["updatedAt"] === "number") profile.updatedAt = data["updatedAt"];
  if (typeof data["lastPurchaseAt"] === "number") profile.lastPurchaseAt = data["lastPurchaseAt"];
  if (
    typeof data["lastPaddleTransactionId"] === "string" ||
    data["lastPaddleTransactionId"] === null
  ) {
    profile.lastPaddleTransactionId = data["lastPaddleTransactionId"] as string | null;
  }
  return profile;
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const db = getFirestoreDb();
  const ref = doc(db, USERS, user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return readProfile(snap.data() as Record<string, unknown>, user);
  }

  const now = Date.now();
  const profile: UserProfile = {
    plan: "free",
    email: user.email,
    displayName: user.displayName,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(ref, profile);
  return profile;
}

export function subscribeUserPlan(
  userId: string,
  onPlan: (plan: PlanId) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = doc(db, USERS, userId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onPlan("free");
        return;
      }
      onPlan(normalizePlan((snap.data() as Record<string, unknown>)["plan"]));
    },
    (err) => {
      onError?.(err);
      onPlan("free");
    },
  );
}

export async function fetchUserPlan(userId: string): Promise<PlanId> {
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, USERS, userId));
  if (!snap.exists()) return "free";
  return normalizePlan((snap.data() as Record<string, unknown>)["plan"]);
}
