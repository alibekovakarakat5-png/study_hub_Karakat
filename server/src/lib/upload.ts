// ── File Upload Middleware ────────────────────────────────────────────────────
//
// Multer configuration for handling file uploads (PDF, DOCX, TXT).
// Files are stored locally in server/uploads/ directory.

import multer from 'multer'
import path from 'path'
import fs from 'fs'

export const UPLOADS_DIR = path.join(__dirname, '../../uploads')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, uniqueName)
  },
})

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.epub']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`Неподдерживаемый формат файла: ${ext}. Допустимые: ${ALLOWED_EXTENSIONS.join(', ')}`))
    }
  },
})

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
  '.epub': 'application/epub+zip',
}
