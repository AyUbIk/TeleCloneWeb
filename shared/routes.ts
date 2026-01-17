import { z } from 'zod';

export const api = {
  gemini: {
    chat: {
      method: 'POST' as const,
      path: '/api/gemini/chat',
      input: z.object({
        prompt: z.string(),
        history: z.array(z.object({
          role: z.enum(['user', 'model']),
          parts: z.string()
        })).optional()
      }),
      responses: {
        200: z.object({ response: z.string() }),
        500: z.object({ message: z.string() })
      }
    }
  }
};
