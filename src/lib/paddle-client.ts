import { initializePaddle, type CheckoutOpenOptions, type Paddle } from "@paddle/paddle-js";

let paddlePromise: Promise<Paddle | undefined> | null = null;
let refreshHandler: (() => void) | null = null;
let errorHandler: ((message: string) => void) | null = null;

function clientToken() {
  return import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim() ?? "";
}

function paddleEnv(): "sandbox" | "production" {
  const raw = (import.meta.env.VITE_PADDLE_ENV || "sandbox").toLowerCase();
  return raw === "production" ? "production" : "sandbox";
}

export function getProPriceId() {
  return import.meta.env.VITE_PADDLE_PRO_PRICE_ID?.trim() ?? "";
}

export function getPremiumPriceId() {
  return import.meta.env.VITE_PADDLE_PREMIUM_PRICE_ID?.trim() ?? "";
}

export function isPaddleConfigured() {
  return Boolean(clientToken() && getProPriceId() && getPremiumPriceId());
}

export function setPaddleAccessRefreshHandler(handler: (() => void) | null) {
  refreshHandler = handler;
}

export function setPaddleCheckoutErrorHandler(handler: ((message: string) => void) | null) {
  errorHandler = handler;
}

export function explainCheckoutError(detail: unknown): string {
  const code = typeof detail === "string" ? detail : "";
  if (code.includes("transaction_default_checkout_url_not_set")) {
    return (
      "Paddle Default payment link missing. " +
      "Paddle → Checkout → Checkout settings → Default payment link → " +
      "http://localhost:8080 (sandbox) or your live site URL, then save."
    );
  }
  if (code) return `Checkout failed: ${code}`;
  return "Checkout failed. Check Paddle token, price IDs, and default payment link.";
}

function eventDetail(event: {
  detail?: unknown;
  error?: { detail?: unknown };
  type?: unknown;
}): unknown {
  return event.detail ?? event.error?.detail ?? event.type ?? null;
}

/** Failed overlays leave a max-z iframe that eats all clicks. Tear it down. */
export function dismissPaddleOverlay(paddle?: Paddle | null) {
  try {
    paddle?.Checkout.close();
  } catch {
    // ignore
  }
  if (typeof document === "undefined") return;
  document
    .querySelectorAll(
      "iframe.paddle-frame, iframe.paddle-frame-overlay, .paddle-frame-overlay, [class*='paddle-frame']",
    )
    .forEach((node) => node.remove());
}

export async function getPaddle(): Promise<Paddle> {
  if (typeof window === "undefined") {
    throw new Error("Paddle only runs in the browser.");
  }
  if (!clientToken()) {
    throw new Error("Paddle client token missing. Set VITE_PADDLE_CLIENT_TOKEN.");
  }
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: paddleEnv(),
      token: clientToken(),
      checkout: {
        settings: {
          displayMode: "overlay",
          theme: "light",
          allowLogout: false,
        },
      },
      eventCallback(event) {
        if (event.name === "checkout.completed") {
          refreshHandler?.();
          return;
        }
        if (event.name === "checkout.error" || event.name === "checkout.failed") {
          void getPaddle()
            .then((p) => dismissPaddleOverlay(p))
            .catch(() => dismissPaddleOverlay(null));
          errorHandler?.(explainCheckoutError(eventDetail(event)));
        }
      },
    }).catch((err) => {
      paddlePromise = null;
      throw err;
    });
  }

  const paddle = await paddlePromise;
  if (!paddle) {
    paddlePromise = null;
    throw new Error(
      "Paddle failed to initialize. Check VITE_PADDLE_CLIENT_TOKEN + VITE_PADDLE_ENV.",
    );
  }
  return paddle;
}

export type OpenCheckoutArgs = {
  plan: "pro" | "premium";
  userId: string;
  email?: string | null;
};

export async function openPlanCheckout(args: OpenCheckoutArgs) {
  const priceId = args.plan === "pro" ? getProPriceId() : getPremiumPriceId();
  if (!priceId) {
    throw new Error(`Missing Paddle price id for ${args.plan}.`);
  }

  // Clear any stuck overlay from a previous failed attempt.
  dismissPaddleOverlay(paddlePromise ? await paddlePromise.catch(() => null) : null);

  const paddle = await getPaddle();

  const options: CheckoutOpenOptions = {
    items: [{ priceId, quantity: 1 }],
    customData: {
      pathwise_user_id: args.userId,
      pathwise_plan: args.plan,
    },
    settings: {
      displayMode: "overlay",
      theme: "light",
      allowLogout: false,
      successUrl: `${window.location.origin}/pro`,
    },
  };

  if (args.email) {
    options.customer = { email: args.email };
  }

  const prev = errorHandler;
  try {
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const done = (fn: () => void) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        fn();
      };

      errorHandler = (message) => {
        dismissPaddleOverlay(paddle);
        prev?.(message);
        done(() => reject(new Error(message)));
      };

      // Loaded overlay = success for opener. Failures usually arrive <2s.
      const timer = window.setTimeout(() => done(() => resolve()), 2500);

      try {
        paddle.Checkout.open(options);
      } catch (err) {
        dismissPaddleOverlay(paddle);
        done(() => reject(err instanceof Error ? err : new Error("Could not open checkout.")));
      }
    });
  } finally {
    errorHandler = prev;
  }
}
