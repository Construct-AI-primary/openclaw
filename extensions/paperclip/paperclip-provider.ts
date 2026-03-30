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
        hint: "API key for Paperclip AI orchestration platform",
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
          groupHint: "Paperclip AI orchestration platform",
        },
      }),
    ],
    capabilities: {
      providerFamily: "openai", // Assume OpenAI-compatible for AI inference
    },
    normalizeTransport: ({ provider, api, baseUrl }) => {
      if (normalizeProviderId(provider) !== PROVIDER_ID) {
        return undefined;
      }
      // Default to OpenAI-compatible API for model inference
      return {
        api: api || "openai-responses",
        baseUrl: baseUrl || PAPERCLIP_BASE_URL,
      };
    },
  };
}

// Construct AI Stack Integration Tools
// These tools allow OpenClaw agents to interact with Paperclip orchestration
// Note: Tool definitions will be registered in the plugin entry point
export const paperclipToolDefinitions = {
  registerAgent: {
    name: "paperclip_register_agent",
    description: "Register this OpenClaw agent with Paperclip orchestration platform",
    parameters: {
      type: "object",
      properties: {
        agentId: { type: "string" },
        team: {
          type: "string",
          enum: ["DevForge", "Loopy", "QualityForge"]
        },
        capabilities: {
          type: "array",
          items: { type: "string" }
        },
        metadata: {
          type: "object",
          additionalProperties: true
        }
      },
      required: ["agentId", "team", "capabilities"]
    }
  },

  submitTask: {
    name: "paperclip_submit_task",
    description: "Submit a task to Paperclip for orchestration across the Construct AI stack",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string" },
        type: {
          type: "string",
          enum: ["coding", "testing", "review", "orchestration"]
        },
        title: { type: "string" },
        description: { type: "string" },
        assignedAgents: {
          type: "array",
          items: { type: "string" }
        },
        workflow: { type: "string" },
        context: {
          type: "object",
          additionalProperties: true
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "urgent"]
        },
        deadline: { type: "string" }
      },
      required: ["id", "type", "title", "description"]
    }
  },

  getAgentStatus: {
    name: "paperclip_get_agent_status",
    description: "Get the current status of an agent from Paperclip",
    parameters: {
      type: "object",
      properties: {
        agentId: { type: "string" }
      },
      required: ["agentId"]
    }
  },

  executeWorkflow: {
    name: "paperclip_execute_workflow",
    description: "Execute a Superpowers workflow phase through Paperclip",
    parameters: {
      type: "object",
      properties: {
        workflowId: { type: "string" },
        phase: {
          type: "string",
          enum: ["brainstorm", "spec", "plan", "implement", "verify"]
        },
        agents: {
          type: "array",
          items: { type: "string" }
        },
        context: {
          type: "object",
          additionalProperties: true
        }
      },
      required: ["workflowId", "phase", "agents", "context"]
    }
  },

  updateTaskProgress: {
    name: "paperclip_update_progress",
    description: "Update task progress in Paperclip orchestration",
    parameters: {
      type: "object",
      properties: {
        taskId: { type: "string" },
        status: {
          type: "string",
          enum: ["in_progress", "completed", "failed"]
        },
        progress: { type: "number" },
        result: { additionalProperties: true },
        error: { type: "string" }
      },
      required: ["taskId", "status"]
    }
  },

  getAvailableAgents: {
    name: "paperclip_get_available_agents",
    description: "Get available agents from Paperclip by team or capabilities",
    parameters: {
      type: "object",
      properties: {
        team: { type: "string" },
        capabilities: {
          type: "array",
          items: { type: "string" }
        },
        minAvailability: { type: "number" }
      }
    }
  },

  storeContext: {
    name: "paperclip_store_context",
    description: "Store agent context/memory in Supabase via Paperclip",
    parameters: {
      type: "object",
      properties: {
        agentId: { type: "string" },
        type: { type: "string" },
        data: {
          type: "object",
          additionalProperties: true
        },
        ttl: { type: "number" }
      },
      required: ["agentId", "type", "data"]
    }
  },

  retrieveContext: {
    name: "paperclip_retrieve_context",
    description: "Retrieve agent context/memory from Supabase via Paperclip",
    parameters: {
      type: "object",
      properties: {
        agentId: { type: "string" },
        type: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" }
        },
        limit: { type: "number" }
      }
    }
  }
};
