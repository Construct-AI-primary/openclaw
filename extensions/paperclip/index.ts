import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { buildPaperclipProvider, paperclipToolDefinitions } from "./paperclip-provider.js";

// Helper function to make API calls to Paperclip
async function callPaperclipAPI(api: any, endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  // Get API key from OpenClaw config
  const config = api.config;
  let apiKey = config?.secrets?.PAPERCLIP_API_KEY ||
               config?.env?.PAPERCLIP_API_KEY;

  if (!apiKey) {
    throw new Error('PAPERCLIP_API_KEY not found in OpenClaw config. Please set it in your configuration.');
  }

  const url = `https://paperclip-render.onrender.com${endpoint}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Paperclip API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Paperclip API call failed: ${error}`);
    throw error;
  }
}

export default definePluginEntry({
  id: "paperclip",
  name: "Paperclip AI Provider",
  description: "Bundled Paperclip AI provider plugin for OpenClaw with orchestration tools",
  register(api) {
    // Register the AI provider
    api.registerProvider(buildPaperclipProvider());

    // Register Construct AI Stack Integration Tools
    // These tools allow OpenClaw agents to interact with Paperclip orchestration

    // Register agent with Paperclip
    api.registerTool({
      name: paperclipToolDefinitions.registerAgent.name,
      description: paperclipToolDefinitions.registerAgent.description,
      parameters: paperclipToolDefinitions.registerAgent.parameters,
      execute: async (_id: string, params: any) => {
        try {
          await callPaperclipAPI(api, '/api/agents/register', 'POST', params);
          return {
            content: [{
              type: "text",
              text: `Successfully registered agent ${params.agentId} with Paperclip (${params.team} team)`
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: "text",
              text: `Failed to register agent: ${error.message || error}`
            }]
          };
        }
      },
    });

    // Submit task to Paperclip
    api.registerTool({
      name: paperclipToolDefinitions.submitTask.name,
      description: paperclipToolDefinitions.submitTask.description,
      parameters: paperclipToolDefinitions.submitTask.parameters,
      execute: async (_id: string, params: any) => {
        try {
          await callPaperclipAPI(api, '/api/tasks', 'POST', params);
          return {
            content: [{
              type: "text",
              text: `Successfully submitted task "${params.title}" to Paperclip orchestration`
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: "text",
              text: `Failed to submit task: ${error.message || error}`
            }]
          };
        }
      },
    });

    // Get agent status
    api.registerTool({
      name: paperclipToolDefinitions.getAgentStatus.name,
      description: paperclipToolDefinitions.getAgentStatus.description,
      parameters: paperclipToolDefinitions.getAgentStatus.parameters,
      execute: async (_id: string, params: any) => {
        try {
          const status = await callPaperclipAPI(api, `/api/agents/${params.agentId}/status`);
          return {
            content: [{
              type: "text",
              text: `Agent ${params.agentId} status: ${JSON.stringify(status, null, 2)}`
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: "text",
              text: `Failed to get agent status: ${error.message || error}`
            }]
          };
        }
      },
    });

    // Execute Superpowers workflow
    api.registerTool({
      name: paperclipToolDefinitions.executeWorkflow.name,
      description: paperclipToolDefinitions.executeWorkflow.description,
      parameters: paperclipToolDefinitions.executeWorkflow.parameters,
      execute: async (_id: string, params: any) => {
        try {
          const result = await callPaperclipAPI(api, '/api/workflows/execute', 'POST', {
            ...params,
            status: "running"
          });
          return {
            content: [{
              type: "text",
              text: `Successfully initiated ${params.phase} phase for workflow ${params.workflowId}`
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: "text",
              text: `Failed to execute workflow: ${error.message || error}`
            }]
          };
        }
      },
    });

    // Update task progress
    api.registerTool({
      name: paperclipToolDefinitions.updateTaskProgress.name,
      description: paperclipToolDefinitions.updateTaskProgress.description,
      parameters: paperclipToolDefinitions.updateTaskProgress.parameters,
      execute: async (_id: string, params: any) => {
        try {
          await callPaperclipAPI(api, `/api/tasks/${params.taskId}/progress`, 'PUT', params);
          return {
            content: [{
              type: "text",
              text: `Successfully updated progress for task ${params.taskId}: ${params.status}`
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: "text",
              text: `Failed to update task progress: ${error.message || error}`
            }]
          };
        }
      },
    });

    // Get available agents
    api.registerTool({
      name: paperclipToolDefinitions.getAvailableAgents.name,
      description: paperclipToolDefinitions.getAvailableAgents.description,
      parameters: paperclipToolDefinitions.getAvailableAgents.parameters,
      execute: async (_id: string, params: any) => {
        try {
          const agents = await callPaperclipAPI(api, '/api/agents/available', 'GET', params);
          return {
            content: [{
              type: "text",
              text: `Available agents: ${JSON.stringify(agents, null, 2)}`
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: "text",
              text: `Failed to get available agents: ${error.message || error}`
            }]
          };
        }
      },
    });

    // Store context in Supabase
    api.registerTool({
      name: paperclipToolDefinitions.storeContext.name,
      description: paperclipToolDefinitions.storeContext.description,
      parameters: paperclipToolDefinitions.storeContext.parameters,
      execute: async (_id: string, params: any) => {
        try {
          await callPaperclipAPI(api, '/api/context/store', 'POST', params);
          return {
            content: [{
              type: "text",
              text: `Successfully stored context for agent ${params.agentId} (${params.type})`
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: "text",
              text: `Failed to store context: ${error.message || error}`
            }]
          };
        }
      },
    });

    // Retrieve context from Supabase
    api.registerTool({
      name: paperclipToolDefinitions.retrieveContext.name,
      description: paperclipToolDefinitions.retrieveContext.description,
      parameters: paperclipToolDefinitions.retrieveContext.parameters,
      execute: async (_id: string, params: any) => {
        try {
          const context = await callPaperclipAPI(api, '/api/context/retrieve', 'GET', params);
          return {
            content: [{
              type: "text",
              text: `Retrieved context: ${JSON.stringify(context, null, 2)}`
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: "text",
              text: `Failed to retrieve context: ${error.message || error}`
            }]
          };
        }
      },
    });
  },
});
