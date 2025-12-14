import { useState, useCallback } from "react";
import { getModels } from "@workspace/ui/lib/ai-client";

export function useAI() {
  const [isChecking, setIsChecking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const checkConnection = useCallback(
    async (url: string, apiKey?: string, provider?: string) => {
      setIsChecking(true);
      setIsConnected(false);
      setAvailableModels([]);

      try {
        const models = await getModels(url, apiKey, provider);
        setAvailableModels(models);
        setIsConnected(true);
        return true;
      } catch (error) {
        console.error("AI connection failed:", error);
        return false;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  return {
    isChecking,
    isConnected,
    availableModels,
    checkConnection,
  };
}
