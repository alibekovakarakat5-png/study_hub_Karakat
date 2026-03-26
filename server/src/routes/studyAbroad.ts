// ── Study Abroad API Routes ──────────────────────────────────────────────────
//
// GET /api/study-abroad         — list all active countries
// GET /api/study-abroad/:code   — get country by code

import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()

// ── GET /api/study-abroad — list all active countries ────────────────────────

router.get('/', async (_req, res) => {
  const countries = await prisma.studyAbroadCountry.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  res.json({ countries })
})

// ── GET /api/study-abroad/all — admin: all countries ─────────────────────────

router.get('/all', verifyToken, requireRole('admin'), async (_req, res) => {
  const countries = await prisma.studyAbroadCountry.findMany({
    orderBy: { order: 'asc' },
  })
  res.json({ countries })
})

// ── GET /api/study-abroad/:code — get country by code ────────────────────────

router.get('/:code', async (req, res) => {
  const country = await prisma.studyAbroadCountry.findUnique({
    where: { countryCode: (req.params['code'] as string).toUpperCase() },
  })

  if (!country || !country.isActive) {
    res.status(404).json({ error: 'Страна не найдена' })
    return
  }

  res.json({ country })
})

// ── POST /api/study-abroad — admin: create country ───────────────────────────

router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const country = await prisma.studyAbroadCountry.create({
    data: req.body,
  })
  res.status(201).json({ country })
})

// ── PUT /api/study-abroad/:code — admin: update country ──────────────────────

router.put('/:code', verifyToken, requireRole('admin'), async (req, res) => {
  const country = await prisma.studyAbroadCountry.update({
    where: { countryCode: (req.params['code'] as string).toUpperCase() },
    data: req.body,
  })
  res.json({ country })
})

export default router
