import { z } from 'zod'

export const studyChatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(6000),
  })).max(10).default([]),
})
