import { createProviderApiKeyAuthMethod } from "openclaw/plugin-sdk/provider-auth-api-key";
import { normalizeProviderId, type ProviderPlugin } from "openclaw/plugin-sdk/provider-model-shared";

const PROVIDER_ID = "paperclip";
const PAPERCLIP_DEFAULT_MODEL = "paperclip/gpt-4";
const PAPERCLIP_BASE_URL = "https://paperclip-render.onrender.com";

export function buildPaperclipProvider(): ProviderPlugin {
  return {
    id: PROVIDER_ID,
    label: "Paperclip AI",
    docsPath: "/providers/models",
    envVars: ["PAPERCLIP_API_KEY"],
    auth: [
      createProviderApiKeyAuthMethod({
        providerId: PROVIDER_ID,
        methodId: "api-key",
        label: "Paperclip API key",
        hint: "API key for Paperclip AI hosted on Render",
        optionKey: "paperclipApiKey",
        flagName: "--paperclip-api-key",
        envVar: "PAPERCLIP_API_KEY",
        promptMessage: "Enter Paperclip API key",
        defaultModel: PAPERCLIP_DEFAULT_MODEL,
        expectedProviders: ["paperclip"],
        wizard: {
          choiceId: "paperclip-api-key",
          choiceLabel: "Paperclip API key",
          groupId: "paperclip",
          groupLabel: "Paperclip",
          groupHint: "Paperclip AI provider",
        },
      }),
    ],
    capabilities: {
      providerFamily: "openai", // Assume OpenAI-compatible for now
    },
    normalizeTransport: ({ provider, api, baseUrl }) => {
      if (normalizeProviderId(provider) !== PROVIDER_ID) {
        return undefined;
      }
      // Default to OpenAI-compatible API
      return {
        api: api || "openai-responses",
        baseUrl: baseUrl || PAPERCLIP_BASE_URL,
      };
    },
  };
}
