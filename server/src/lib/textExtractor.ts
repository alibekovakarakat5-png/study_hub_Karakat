// ── Text Extraction from uploaded files ──────────────────────────────────────
//
// Extracts plain text from PDF, DOCX, and TXT files for AI processing.

import fs from 'fs'
import path from 'path'

export interface ExtractedText {
  text: string
  pageCount?: number
  wordCount: number
}

/**
 * Extract text content from a file based on its extension.
 * Supports: .pdf, .docx, .txt
 */
export async function extractText(filePath: string): Promise<ExtractedText> {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.txt') {
    const text = fs.readFileSync(filePath, 'utf-8')
    return {
      text,
      wordCount: countWords(text),
    }
  }

  if (ext === '.pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>
    const buffer = fs.readFileSync(filePath)
    const data = await pdfParse(buffer)
    return {
      text: data.text,
      pageCount: data.numpages,
      wordCount: countWords(data.text),
    }
  }

  if (ext === '.docx') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ path: filePath })
    return {
      text: result.value,
      wordCount: countWords(result.value),
    }
  }

  throw new Error(`Неподдерживаемый формат файла: ${ext}`)
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length
}
