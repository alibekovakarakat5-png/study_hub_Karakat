import crypto from 'crypto'

// ── KaspiPay Integration ───────────────────────────────────────────────────────
//
// KaspiPay Gold QR / Deep Link Payment
// Docs: https://kaspi.kz/pay/docs
//
// Env vars needed:
//   KASPI_MERCHANT_ID    — Merchant account ID from Kaspi
//   KASPI_SECRET_KEY     — Secret key for HMAC signature verification
//   KASPI_RETURN_URL     — Frontend redirect URL after payment
//
// Flow:
//   1. POST /api/billing/kaspi/create → creates order, returns deep link
//   2. User pays in Kaspi app
//   3. Kaspi POST webhook → /api/billing/kaspi/webhook
//   4. We verify signature, activate subscription
// ────────────────────────────────────────────────────────────────────────────────

export interface KaspiPayConfig {
  merchantId: string
  secretKey: string
  returnUrl: string
  enabled: boolean
}

export function getKaspiConfig(): KaspiPayConfig {
  const merchantId = process.env.KASPI_MERCHANT_ID ?? ''
  const secretKey = process.env.KASPI_SECRET_KEY ?? ''
  const returnUrl = process.env.KASPI_RETURN_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:5173'

  return {
    merchantId,
    secretKey,
    returnUrl: `${returnUrl}/pricing?payment=success`,
    enabled: Boolean(merchantId && secretKey),
  }
}

// ── Generate order ID ──────────────────────────────────────────────────────────

export function generateOrderId(): string {
  return `SH-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
}

// ── Build Kaspi Pay link ───────────────────────────────────────────────────────
// Deep link format: https://kaspi.kz/pay/MERCHANT_ID?orderId=X&amount=Y&...

export function buildKaspiPayLink(params: {
  orderId: string
  amount: number
  description: string
}): string {
  const config = getKaspiConfig()
  const { orderId, amount, description } = params

  const qs = new URLSearchParams({
    service: config.merchantId,
    amount: String(amount),
    orderId,
    returnUrl: config.returnUrl,
    description,
  })

  return `https://kaspi.kz/pay?${qs.toString()}`
}

// ── Build Kaspi QR data ────────────────────────────────────────────────────────

export function buildKaspiQrData(params: {
  orderId: string
  amount: number
  description: string
}): string {
  // QR content is the same pay link — Kaspi app scans and opens payment
  return buildKaspiPayLink(params)
}

// ── Verify webhook signature ───────────────────────────────────────────────────
// Kaspi sends HMAC-SHA256 signature in X-Kaspi-Signature header

export function verifyKaspiSignature(payload: string, signature: string): boolean {
  const config = getKaspiConfig()
  if (!config.secretKey) return false

  const expected = crypto
    .createHmac('sha256', config.secretKey)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex'),
  )
}

// ── Webhook payload type ───────────────────────────────────────────────────────

export interface KaspiWebhookPayload {
  txnId: string           // Kaspi transaction ID
  orderId: string         // our order ID (SH-xxx)
  amount: number          // amount in KZT
  status: 'success' | 'failed' | 'pending'
  accountId?: string      // payer's Kaspi account
  timestamp: string       // ISO 8601
}
