import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

/** Current provider/model names, resolved from env (audit trail). */
export function aiProvider(): { provider: string; model: string } {
  return {
    provider: process.env.AI_PROVIDER ?? "google",
    model: process.env.AI_MODEL ?? "gemini-2.0-flash",
  };
}

/**
 * Provider-agnostic model resolver. Adding a provider = a new `case` here.
 * Calling code must never hardcode a provider.
 */
export function resolveModel() {
  const { provider, model } = aiProvider();

  switch (provider) {
    case "google":
      return google(model);
    case "groq":
      return groq(model);
    default:
      throw new Error(
        `Unknown AI_PROVIDER: "${provider}". Supported: google, groq`
      );
  }
}
