// ── Course Generation Route ──────────────────────────────────────────────────
//
// POST /api/courses/generate — generate course from uploaded file or raw text

import { Router } from 'express'
import path from 'path'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../middleware/auth'
import { extractText } from '../lib/textExtractor'
import { generateCourseFromText } from '../lib/courseGenerator'
import { UPLOADS_DIR } from '../lib/upload'

const router = Router()

// ── POST /api/courses/generate ───────────────────────────────────────────────
//
// Body (option A): { uploadId: string, subject?: string, level?: string, title?: string }
// Body (option B): { text: string, subject?: string, level?: string, title?: string }

router.post('/generate', verifyToken, async (req, res) => {
  const userId = req.user!.userId
  const { uploadId, text: rawText, subject, level, title } = req.body

  let text: string

  if (uploadId) {
    // Get text from uploaded file
    const file = await prisma.uploadedFile.findUnique({ where: { id: uploadId } })
    if (!file) {
      res.status(404).json({ error: 'Загруженный файл не найден' })
      return
    }

    // Check ownership
    if (file.uploadedBy !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Нет доступа к этому файлу' })
      return
    }

    // Update status
    await prisma.uploadedFile.update({
      where: { id: uploadId },
      data: { status: 'processing' },
    })

    try {
      const filePath = path.join(UPLOADS_DIR, file.storagePath)
      const extracted = await extractText(filePath)
      text = extracted.text
    } catch (err: any) {
      await prisma.uploadedFile.update({
        where: { id: uploadId },
        data: { status: 'error', errorMsg: err.message },
      })
      res.status(500).json({ error: `Ошибка извлечения текста: ${err.message}` })
      return
    }
  } else if (rawText && typeof rawText === 'string') {
    text = rawText
  } else {
    res.status(400).json({ error: 'Укажите uploadId или text в теле запроса' })
    return
  }

  if (text.trim().length < 100) {
    res.status(400).json({ error: 'Текст слишком короткий для генерации курса (минимум 100 символов)' })
    return
  }

  try {
    const result = await generateCourseFromText(text, {
      subject,
      level,
      userId,
      title,
    })

    // Link upload to course
    if (uploadId) {
      await prisma.uploadedFile.update({
        where: { id: uploadId },
        data: { status: 'done', courseId: result.courseId },
      })
    }

    res.status(201).json({
      courseId: result.courseId,
      title: result.course.title,
      modulesCount: result.course.modules.length,
      lessonsCount: result.course.modules.reduce((sum, m) => sum + m.lessons.length, 0),
    })
  } catch (err: any) {
    if (uploadId) {
      await prisma.uploadedFile.update({
        where: { id: uploadId },
        data: { status: 'error', errorMsg: err.message },
      })
    }
    res.status(500).json({ error: `Ошибка генерации курса: ${err.message}` })
  }
})

export default router
