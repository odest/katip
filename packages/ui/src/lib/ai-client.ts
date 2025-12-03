import OpenAI from "openai";
import { isTauri } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { SYSTEM_PROMPT } from "@workspace/ui/config/prompt";

export const AI_PROVIDERS = [
  { id: "ollama", name: "Ollama", defaultUrl: "http://localhost:11434" },
  {
    id: "llama-cpp",
    name: "Llama.cpp",
    defaultUrl: "http://localhost:8080/v1",
  },
  {
    id: "lm-studio",
    name: "LM Studio",
    defaultUrl: "http://localhost:1234/v1",
  },
  { id: "openai-compatible", name: "OpenAI Compatible", defaultUrl: "" },
] as const;

export interface SummaryResult {
  summary: string;
  action_items: Array<{
    task: string;
    assignee: string;
    priority: string;
    completed?: boolean;
  }>;
}

function createClient(baseUrl: string) {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  let url = cleanBaseUrl;

  if (!cleanBaseUrl.endsWith("/v1")) {
    url = `${cleanBaseUrl}/v1`;
  }

  // Determine which fetch to use
  // If running in Tauri, use the plugin-http fetch (bypasses some CORS/SSL issues)
  // If running in Web, use the native window.fetch
  const customFetch = isTauri() ? tauriFetch : fetch;

  return new OpenAI({
    baseURL: url,
    apiKey: "ollama", // Dummy key required by SDK
    dangerouslyAllowBrowser: true,
    fetch: customFetch,
  });
}

export async function getModels(baseUrl: string): Promise<string[]> {
  try {
    const client = createClient(baseUrl);
    const response = await client.models.list();
    return response.data.map((m) => m.id);
  } catch (error) {
    console.error("Error fetching models:", error);
    throw error;
  }
}

export async function generateSummary(
  text: string,
  model: string,
  baseUrl: string,
  provider?: string
): Promise<SummaryResult> {
  try {
    const client = createClient(baseUrl);
    const options: any = {
      model: model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: text,
        },
      ],
      stream: false,
    };

    // LM Studio requires json_schema for structured output
    if (provider === "lm-studio") {
      options.response_format = {
        type: "json_schema",
        json_schema: {
          name: "summary_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              action_items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    task: { type: "string" },
                    assignee: { type: "string" },
                    priority: { type: "string" },
                    completed: { type: "boolean" },
                  },
                  required: ["task", "assignee", "priority"],
                },
              },
            },
            required: ["summary", "action_items"],
          },
        },
      };
    } else {
      options.response_format = { type: "json_object" };
    }

    const response = await client.chat.completions.create(options);

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    try {
      const parsedContent = JSON.parse(content);
      return parsedContent as SummaryResult;
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("Failed to parse summary response");
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}
