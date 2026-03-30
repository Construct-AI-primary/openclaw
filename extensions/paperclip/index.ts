import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { buildPaperclipProvider } from "./paperclip-provider.js";

export default definePluginEntry({
  id: "paperclip",
  name: "Paperclip AI Provider",
  description: "Bundled Paperclip AI provider plugin for OpenClaw",
  register(api) {
    api.registerProvider(buildPaperclipProvider());
  },
});
