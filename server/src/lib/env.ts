/**
 * Validate required environment variables on startup.
 * Fails fast with clear error message if something is missing.
 */

interface EnvConfig {
  DATABASE_URL: string
  JWT_SECRET: string
  PORT: number
  NODE_ENV: string
  FRONTEND_URL: string
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_ADMIN_CHAT_ID?: string
  ANTHROPIC_API_KEY?: string
  KASPI_MERCHANT_ID?: string
  KASPI_SECRET_KEY?: string
  KASPI_RETURN_URL?: string
}

export function validateEnv(): EnvConfig {
  const missing: string[] = []

  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL')

  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      missing.push('JWT_SECRET')
    } else {
      console.warn('⚠️  JWT_SECRET not set — using insecure default (OK for development)')
    }
  }

  if (missing.length > 0) {
    console.error(`\n❌ Missing required environment variables:\n   ${missing.join('\n   ')}\n`)
    console.error('   Create a .env file in server/ directory. See .env.example for reference.\n')
    process.exit(1)
  }

  // Warn about optional but recommended vars
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN not set — Telegram bot disabled')
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set — AI features disabled')
  }
  if (!process.env.KASPI_MERCHANT_ID || !process.env.KASPI_SECRET_KEY) {
    console.warn('⚠️  KASPI_MERCHANT_ID / KASPI_SECRET_KEY not set — KaspiPay disabled (WhatsApp fallback)')
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    PORT: Number(process.env.PORT ?? 3001),
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_ADMIN_CHAT_ID: process.env.TELEGRAM_ADMIN_CHAT_ID,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    KASPI_MERCHANT_ID: process.env.KASPI_MERCHANT_ID,
    KASPI_SECRET_KEY: process.env.KASPI_SECRET_KEY,
    KASPI_RETURN_URL: process.env.KASPI_RETURN_URL,
  }
}
