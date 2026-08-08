import { initializePaddle, type CheckoutOpenOptions, type Paddle } from "@paddle/paddle-js";

let paddlePromise: Promise<Paddle | undefined> | null = null;
let refreshHandler: (() => void) | null = null;

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

export async function getPaddle(): Promise<Paddle> {
  if (!clientToken()) {
    throw new Error("Paddle client token missing. Set VITE_PADDLE_CLIENT_TOKEN.");
  }
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: paddleEnv(),
      token: clientToken(),
      eventCallback(event) {
        if (event.name === "checkout.completed") {
          refreshHandler?.();
        }
      },
    });
  }
  const paddle = await paddlePromise;
  if (!paddle) throw new Error("Paddle failed to initialize.");
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
    },
  };

  if (args.email) {
    options.customer = { email: args.email };
  }

  paddle.Checkout.open(options);
}
