import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Define input type locally since we can't import Zod schemas directly in frontend build sometimes
// But ideally we import from shared. Using standard TS interface for now.
interface GeminiChatInput {
  prompt: string;
  history?: { role: "user" | "model"; parts: string }[];
}

export function useGeminiChat() {
  return useMutation({
    mutationFn: async (data: GeminiChatInput) => {
      const res = await fetch(api.gemini.chat.path, {
        method: api.gemini.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to get response from Gemini");
      }

      return await res.json() as { response: string };
    },
  });
}
