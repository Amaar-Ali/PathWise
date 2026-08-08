export const AI_NOT_CONFIGURED_MESSAGE =
  "AI is not configured. Set GROQ_API_KEY in .env.local (server-only; never VITE_), then restart the dev server.";

export const AI_OUT_OF_CREDITS_MESSAGE =
  "Groq quota or billing blocked this request. Check https://console.groq.com then restart and try again.";

export function isAiNotConfiguredError(message: string): boolean {
  return /AI is not configured|GROQ_API_KEY|OPENROUTER_API_KEY/i.test(message);
}

export function isAiCreditsError(message: string): boolean {
  return (
    /Groq quota|out of (thinking )?credits|insufficient[_\s-]?credits|payment required|quota/i.test(
      message,
    ) || /console\.groq\.com|openrouter\.ai\/settings\/credits/i.test(message)
  );
}

export function isAiHardFailure(message: string): boolean {
  return isAiNotConfiguredError(message) || isAiCreditsError(message);
}
