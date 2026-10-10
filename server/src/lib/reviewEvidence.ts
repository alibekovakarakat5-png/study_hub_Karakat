import { createHash } from 'crypto'
import { z } from 'zod'

export const evidenceContext = {
  runId: z.string().uuid(), stepId: z.string().max(80), path: z.string().max(2048),
  sessionId: z.string().uuid().optional(), section: z.string().trim().max(200).default(''),
  capturedAt: z.string().datetime().optional(),
  viewport: z.object({ width: z.number().int().min(1).max(16000), height: z.number().int().min(1).max(16000) }).strict().optional(),
}
// Raster images only. Private JSON records are never served as public uploads.
export const screenshotSchema = z.string().max(1100000).refine(value => {
  const match = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value)
  if (!match) return false
  const bytes = Buffer.from(match[2], 'base64')
  if (bytes.length > 800000 || bytes.toString('base64') !== match[2]) return false
  return match[1] === 'png'
    ? bytes.length >= 33 && bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) && bytes.subarray(12,16).toString() === 'IHDR'
    : bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 && bytes.at(-2) === 255 && bytes.at(-1) === 217
}, 'Прикрепите PNG или JPEG размером до 800 КБ.')
export const evidenceDigest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
