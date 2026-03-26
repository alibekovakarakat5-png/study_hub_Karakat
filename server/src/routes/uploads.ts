// ── File Upload Routes ───────────────────────────────────────────────────────
//
// POST   /api/uploads           — upload file (authenticated)
// GET    /api/uploads           — list user's uploads (admin sees all)
// GET    /api/uploads/:id       — get upload status
// GET    /api/uploads/:id/download — download file
// DELETE /api/uploads/:id       — delete file + record

import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'
import { upload, UPLOADS_DIR } from '../lib/upload'
import { extractText } from '../lib/textExtractor'

const router = Router()

// ── POST /api/uploads — upload a file ────────────────────────────────────────

router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  const file = req.file
  if (!file) {
    res.status(400).json({ error: 'Файл не найден в запросе' })
    return
  }

  const userId = req.user!.userId

  const record = await prisma.uploadedFile.create({
    data: {
      filename: file.originalname,
      storagePath: file.filename, // relative to uploads dir
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: userId,
      status: 'pending',
    },
  })

  // Start text extraction in background
  extractText(path.join(UPLOADS_DIR, file.filename))
    .then(async (extracted) => {
      await prisma.uploadedFile.update({
        where: { id: record.id },
        data: {
          status: 'done',
          metadata: {
            pageCount: extracted.pageCount ?? null,
            wordCount: extracted.wordCount,
            textPreview: extracted.text.slice(0, 500),
          } as any,
        },
      })
    })
    .catch(async (err) => {
      await prisma.uploadedFile.update({
        where: { id: record.id },
        data: {
          status: 'error',
          errorMsg: err.message,
        },
      })
    })

  res.status(201).json({
    file: {
      id: record.id,
      filename: record.filename,
      sizeBytes: record.sizeBytes,
      mimeType: record.mimeType,
      status: record.status,
    },
  })
})

// ── GET /api/uploads — list uploads ──────────────────────────────────────────

router.get('/', verifyToken, async (req, res) => {
  const userId = req.user!.userId
  const isAdmin = req.user!.role === 'admin'

  const where = isAdmin ? {} : { uploadedBy: userId }

  const files = await prisma.uploadedFile.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  res.json({ files })
})

// ── GET /api/uploads/:id — get upload status ─────────────────────────────────

router.get('/:id', verifyToken, async (req, res) => {
  const file = await prisma.uploadedFile.findUnique({
    where: { id: req.params['id'] as string },
  })

  if (!file) {
    res.status(404).json({ error: 'Файл не найден' })
    return
  }

  // Only owner or admin can view
  if (file.uploadedBy !== req.user!.userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет доступа' })
    return
  }

  res.json({ file })
})

// ── GET /api/uploads/:id/download — download file ───────────────────────────

router.get('/:id/download', verifyToken, async (req, res) => {
  const file = await prisma.uploadedFile.findUnique({
    where: { id: req.params['id'] as string },
  })

  if (!file) {
    res.status(404).json({ error: 'Файл не найден' })
    return
  }

  const filePath = path.join(UPLOADS_DIR, file.storagePath)
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Файл не найден на диске' })
    return
  }

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.filename)}"`)
  res.setHeader('Content-Type', file.mimeType)
  res.sendFile(filePath)
})

// ── GET /api/uploads/:id/text — get extracted text ──────────────────────────

router.get('/:id/text', verifyToken, async (req, res) => {
  const file = await prisma.uploadedFile.findUnique({
    where: { id: req.params['id'] as string },
  })

  if (!file) {
    res.status(404).json({ error: 'Файл не найден' })
    return
  }

  if (file.uploadedBy !== req.user!.userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет доступа' })
    return
  }

  const filePath = path.join(UPLOADS_DIR, file.storagePath)
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Файл не найден на диске' })
    return
  }

  try {
    const extracted = await extractText(filePath)
    res.json({ text: extracted.text, wordCount: extracted.wordCount, pageCount: extracted.pageCount })
  } catch (err: any) {
    res.status(500).json({ error: `Ошибка извлечения текста: ${err.message}` })
  }
})

// ── DELETE /api/uploads/:id — delete file ────────────────────────────────────

router.delete('/:id', verifyToken, async (req, res) => {
  const file = await prisma.uploadedFile.findUnique({
    where: { id: req.params['id'] as string },
  })

  if (!file) {
    res.status(404).json({ error: 'Файл не найден' })
    return
  }

  // Only owner or admin can delete
  if (file.uploadedBy !== req.user!.userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет доступа' })
    return
  }

  // Delete file from disk
  const filePath = path.join(UPLOADS_DIR, file.storagePath)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  // Delete DB record
  await prisma.uploadedFile.delete({ where: { id: file.id } })

  res.json({ ok: true })
})

export default router
