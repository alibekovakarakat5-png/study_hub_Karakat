// ── Text chunker ────────────────────────────────────────────────────────────
//
// Split a long text into chunks suitable for Groq generation. Each chunk
// stays within `maxChars` characters. Splitting happens at natural
// boundaries with graceful fallback:
//   1. Try paragraph splits (\n\n). Greedily pack paragraphs.
//   2. If a single paragraph is bigger than maxChars, sentence-split it.
//   3. If a single sentence is bigger than maxChars, hard-cut.
//
// Optionally caps the total number of chunks (`maxChunks`) — when reached,
// the remainder is appended to the last chunk (truncated to maxChars).

const DEFAULT_MAX_CHARS  = 6000
const DEFAULT_MAX_CHUNKS = 8

export function chunkText(text: string, maxChars: number = DEFAULT_MAX_CHARS, maxChunks: number = DEFAULT_MAX_CHUNKS): string[] {
  if (!text) return []
  if (text.length <= maxChars) return [text]

  // Stage 1: paragraph greedy pack
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const chunks: string[] = []
  let buffer = ''

  function flush(): void {
    if (buffer.trim()) chunks.push(buffer.trim())
    buffer = ''
  }

  for (const p of paragraphs) {
    if (p.length > maxChars) {
      // Big paragraph — flush buffer, then split this paragraph by sentences
      flush()
      for (const piece of splitLongPiece(p, maxChars)) {
        chunks.push(piece)
      }
      continue
    }
    if (buffer.length === 0) {
      buffer = p
    } else if (buffer.length + 2 + p.length <= maxChars) {
      buffer = `${buffer}\n\n${p}`
    } else {
      flush()
      buffer = p
    }
  }
  flush()

  // Stage 3: enforce maxChunks cap (overflow → last chunk gets remainder, truncated)
  if (chunks.length > maxChunks) {
    const head = chunks.slice(0, maxChunks - 1)
    const tail = chunks.slice(maxChunks - 1).join('\n\n').slice(0, maxChars)
    return [...head, tail]
  }
  return chunks
}

function splitLongPiece(piece: string, maxChars: number): string[] {
  const sentences = piece.split(/(?<=[.!?])\s+/).filter(Boolean)
  const out: string[] = []
  let buf = ''
  for (const s of sentences) {
    if (s.length > maxChars) {
      // Single sentence too long — hard cut
      if (buf) { out.push(buf); buf = '' }
      for (let i = 0; i < s.length; i += maxChars) out.push(s.slice(i, i + maxChars))
      continue
    }
    if (buf.length === 0) {
      buf = s
    } else if (buf.length + 1 + s.length <= maxChars) {
      buf = `${buf} ${s}`
    } else {
      out.push(buf)
      buf = s
    }
  }
  if (buf) out.push(buf)
  return out
}
