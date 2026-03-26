/**
 * Simple HTML sanitizer — strips dangerous tags/attributes from user input.
 * Use on any user-submitted string before storing in DB.
 */

const DANGEROUS_TAGS = /<\s*\/?\s*(script|iframe|object|embed|link|style|form|base|meta|svg|math|template|xmp)[^>]*>/gi
const EVENT_HANDLERS = /\s*on\w+\s*=\s*["'][^"']*["']/gi
const JAVASCRIPT_URLS = /(?:href|src|action)\s*=\s*["']\s*javascript\s*:/gi

export function sanitizeString(input: string): string {
  return input
    .replace(DANGEROUS_TAGS, '')
    .replace(EVENT_HANDLERS, '')
    .replace(JAVASCRIPT_URLS, '')
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value)
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }
  return result as T
}
