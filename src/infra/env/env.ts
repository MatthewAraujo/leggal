import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_DB: z.coerce.number(),
  REDIS_PASSWORD: z.string(),
  PORT: z.coerce.number().optional().default(3333),
  OPENAI_API_KEY: z.string(),
  LOG_LEVEL: z.enum(['error', 'warn', 'log', 'debug', 'verbose']).optional().default('log'),
})

export type Env = z.infer<typeof envSchema>
