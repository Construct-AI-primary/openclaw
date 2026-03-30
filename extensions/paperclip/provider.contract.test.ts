import { describe, expect, test } from "vitest";
import { buildPaperclipProvider } from "./paperclip-provider.js";

describe("Paperclip Provider", () => {
  test("builds provider with correct id", () => {
    const provider = buildPaperclipProvider();
    expect(provider.id).toBe("paperclip");
    expect(provider.label).toBe("Paperclip AI");
  });

  test("has API key authentication", () => {
    const provider = buildPaperclipProvider();
    expect(provider.auth).toHaveLength(1);
    expect(provider.auth[0].id).toBe("api-key");
  });

  test("normalizes transport correctly", () => {
    const provider = buildPaperclipProvider();
    const result = provider.normalizeTransport?.({
      provider: "paperclip",
      api: undefined,
      baseUrl: undefined,
    });
    expect(result).toEqual({
      api: "openai-responses",
      baseUrl: "https://paperclip-render.onrender.com",
    });
  });
});
