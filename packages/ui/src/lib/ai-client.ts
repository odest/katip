import OpenAI from "openai";
import { isTauri } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { SYSTEM_PROMPT } from "@workspace/ui/config/prompt";

// Base providers available everywhere
const BASE_PROVIDERS = [
  // Local Providers
  {
    id: "ollama",
    name: "Ollama",
    defaultUrl: "http://localhost:11434",
    requiresApiKey: false,
  },
  {
    id: "llama-cpp",
    name: "Llama.cpp",
    defaultUrl: "http://localhost:8080/v1",
    requiresApiKey: false,
  },
  {
    id: "lm-studio",
    name: "LM Studio",
    defaultUrl: "http://localhost:1234/v1",
    requiresApiKey: false,
  },
  // Cloud Providers
  {
    id: "openai",
    name: "OpenAI",
    defaultUrl: "https://api.openai.com/v1",
    requiresApiKey: true,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    defaultUrl: "https://openrouter.ai/api/v1",
    requiresApiKey: true,
  },
  {
    id: "groq",
    name: "Groq",
    defaultUrl: "https://api.groq.com/openai/v1",
    requiresApiKey: true,
  },
  // Custom
  {
    id: "openai-compatible",
    name: "OpenAI Compatible",
    defaultUrl: "",
    requiresApiKey: false,
  },
] as const;

// Gemini only works in Tauri (native) due to CORS restrictions
const GEMINI_PROVIDER = {
  id: "gemini",
  name: "Google Gemini",
  defaultUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
  requiresApiKey: true,
} as const;

// Dynamic provider list: include Gemini only in Tauri
export const AI_PROVIDERS = isTauri()
  ? ([
      ...BASE_PROVIDERS.slice(0, 4),
      GEMINI_PROVIDER,
      ...BASE_PROVIDERS.slice(4),
    ] as const)
  : BASE_PROVIDERS;

export interface SummaryResult {
  summary: string;
  action_items: Array<{
    task: string;
    assignee: string;
    priority: string;
    completed?: boolean;
  }>;
}

function createClient(baseUrl: string, apiKey?: string, provider?: string) {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  let url = cleanBaseUrl;

  if (!cleanBaseUrl.endsWith("/v1")) {
    url = `${cleanBaseUrl}/v1`;
  }

  // Determine which fetch to use
  // If running in Tauri, use the plugin-http fetch (bypasses some CORS/SSL issues)
  // If running in Web, use the native window.fetch
  const customFetch = isTauri() ? tauriFetch : fetch;

  // OpenRouter requires HTTP-Referer header for authentication
  const defaultHeaders: Record<string, string> = {};
  if (provider === "openrouter") {
    defaultHeaders["HTTP-Referer"] = "https://katip.odest.tech";
    defaultHeaders["X-Title"] = "Katip";
  }

  return new OpenAI({
    baseURL: url,
    apiKey: apiKey || "not-needed", // Cloud providers need real key, local providers don't validate
    dangerouslyAllowBrowser: true,
    fetch: customFetch,
    defaultHeaders,
  });
}

export async function getModels(
  baseUrl: string,
  apiKey?: string,
  provider?: string
): Promise<string[]> {
  try {
    const client = createClient(baseUrl, apiKey, provider);
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
  provider?: string,
  apiKey?: string
): Promise<SummaryResult> {
  try {
    const client = createClient(baseUrl, apiKey, provider);
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
