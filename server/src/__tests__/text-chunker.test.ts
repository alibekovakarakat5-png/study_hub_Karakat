import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { chunkText } from '../lib/textChunker'

describe('chunkText', () => {
  it('returns single chunk when text is below limit', () => {
    const chunks = chunkText('a'.repeat(500), 1000)
    assert.equal(chunks.length, 1)
    assert.equal(chunks[0]!.length, 500)
  })

  it('splits on paragraph boundaries first', () => {
    const text = 'Paragraph one is short.\n\nParagraph two is also short.\n\nParagraph three is short too.'
    const chunks = chunkText(text, 50)
    assert.ok(chunks.length >= 2)
    for (const c of chunks) assert.ok(c.length <= 60, `chunk too big: ${c.length}`)
  })

  it('falls back to sentence split when paragraph exceeds limit', () => {
    const sentence = 'This is a sentence with sufficient length. '
    const longParagraph = sentence.repeat(20) // ~860 chars in one paragraph
    const chunks = chunkText(longParagraph, 200)
    assert.ok(chunks.length >= 4)
    for (const c of chunks) assert.ok(c.length <= 250, `chunk too big: ${c.length}`)
  })

  it('hard-cuts when sentence is longer than limit', () => {
    const noPunctuation = 'a'.repeat(1500)
    const chunks = chunkText(noPunctuation, 500)
    assert.ok(chunks.length >= 3)
    for (const c of chunks) assert.ok(c.length <= 500)
  })

  it('respects max chunks cap', () => {
    const giant = 'short paragraph.\n\n'.repeat(1000)
    const chunks = chunkText(giant, 100, 8)
    assert.ok(chunks.length <= 8, `expected <=8, got ${chunks.length}`)
  })

  it('preserves meaningful text (no characters lost)', () => {
    const text = 'Para A.\n\nPara B with more words.\n\nPara C.'
    const chunks = chunkText(text, 50)
    const recombined = chunks.join('\n\n')
    for (const word of ['Para A', 'Para B', 'Para C']) {
      assert.ok(recombined.includes(word), `lost: ${word}`)
    }
  })
})
