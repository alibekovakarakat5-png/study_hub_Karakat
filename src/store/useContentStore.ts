// ── Content Store ─────────────────────────────────────────────────────────────
// Admin-managed content, synced with backend PostgreSQL.
// Falls back to localStorage when server is unavailable.
//
// Flow:
//   Admin panel → add/edit/delete → saved to API (+ localStorage backup)
//   IELTS page + robot reads merged data (hardcoded base + custom content)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IeltsSkill } from '@/data/ieltsContent'
import { contentApi } from '@/lib/api'
import type { ContentType } from '@/lib/api'
import type { AbroadUniversity } from '@/data/universityAdvisor'
import type { Scholarship } from '@/data/scholarships'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CustomMaterial {
  id: string
  title: string
  type: 'book' | 'website' | 'youtube' | 'app'
  description: string
  skill: IeltsSkill | 'all'
  level: 'all' | 'beginner' | 'intermediate' | 'advanced'
  free: boolean
  url?: string
  createdAt: string
}

export interface CustomQA {
  id: string
  keywords: string
  answer: string
  followUp?: string
  mood?: 'happy' | 'excited' | 'thinking' | 'encouraging'
  createdAt: string
}

export interface CustomVocabWord {
  id: string
  topicId: string
  topicName: string
  word: string
  definition: string
  example: string
  createdAt: string
}

// ── Store interface ───────────────────────────────────────────────────────────

interface ContentState {
  materials: CustomMaterial[]
  qas: CustomQA[]
  vocabWords: CustomVocabWord[]
  universities: AbroadUniversity[]
  scholarships: Scholarship[]

  /** Fetch all content from server and update local state */
  syncFromServer: () => Promise<void>

  // Materials
  addMaterial:    (m: Omit<CustomMaterial, 'id' | 'createdAt'>) => Promise<void>
  deleteMaterial: (id: string) => Promise<void>

  // Q&A
  addQA:    (qa: Omit<CustomQA, 'id' | 'createdAt'>) => Promise<void>
  deleteQA: (id: string) => Promise<void>

  // Vocabulary
  addVocabWord:    (w: Omit<CustomVocabWord, 'id' | 'createdAt'>) => Promise<void>
  deleteVocabWord: (id: string) => Promise<void>

  // Universities
  addUniversity:    (u: AbroadUniversity) => Promise<void>
  deleteUniversity: (id: string) => Promise<void>

  // Scholarships
  addScholarship:    (s: Scholarship) => Promise<void>
  deleteScholarship: (id: string) => Promise<void>
}

// ── Helper ────────────────────────────────────────────────────────────────────

function uid(): string {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function now(): string {
  return new Date().toISOString()
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      materials: [],
      qas: [],
      vocabWords: [],
      universities: [],
      scholarships: [],

      // ── Sync from server ────────────────────────────────────────────────────

      syncFromServer: async () => {
        try {
          const [matRes, qaRes, vocabRes, uniRes, schRes] = await Promise.all([
            contentApi.list('ielts_material'),
            contentApi.list('mentor_qa'),
            contentApi.list('vocab_word'),
            contentApi.list('university_entry'),
            contentApi.list('scholarship_entry'),
          ])

          const materials = matRes.items.map((item) => ({
            id: item.id,
            ...(item.data as Omit<CustomMaterial, 'id' | 'createdAt'>),
            createdAt: item.createdAt,
          })) as CustomMaterial[]

          const qas = qaRes.items.map((item) => ({
            id: item.id,
            ...(item.data as Omit<CustomQA, 'id' | 'createdAt'>),
            createdAt: item.createdAt,
          })) as CustomQA[]

          const vocabWords = vocabRes.items.map((item) => ({
            id: item.id,
            ...(item.data as Omit<CustomVocabWord, 'id' | 'createdAt'>),
            createdAt: item.createdAt,
          })) as CustomVocabWord[]

          const universities = uniRes.items.map((item) => ({
            id: item.id,
            ...(item.data as Omit<AbroadUniversity, 'id'>),
          })) as AbroadUniversity[]

          const scholarships = schRes.items.map((item) => ({
            id: item.id,
            ...(item.data as Omit<Scholarship, 'id'>),
          })) as Scholarship[]

          set({ materials, qas, vocabWords, universities, scholarships })
        } catch {
          // Server unavailable — keep existing localStorage data
        }
      },

      // ── Materials ────────────────────────────────────────────────────────────

      addMaterial: async (m) => {
        const local: CustomMaterial = { ...m, id: uid(), createdAt: now() }
        set((s) => ({ materials: [...s.materials, local] }))
        try {
          const res = await contentApi.create({
            type: 'ielts_material' as ContentType,
            data: m as Record<string, unknown>,
          })
          set((s) => ({
            materials: s.materials.map((mat) =>
              mat.id === local.id
                ? { ...mat, id: res.item.id, createdAt: res.item.createdAt }
                : mat
            ),
          }))
        } catch { /* keep local copy */ }
      },

      deleteMaterial: async (id) => {
        set((s) => ({ materials: s.materials.filter((m) => m.id !== id) }))
        try { await contentApi.remove(id) } catch { /* already removed from local */ }
      },

      // ── Q&A ──────────────────────────────────────────────────────────────────

      addQA: async (qa) => {
        const local: CustomQA = { ...qa, id: uid(), createdAt: now() }
        set((s) => ({ qas: [...s.qas, local] }))
        try {
          const res = await contentApi.create({
            type: 'mentor_qa' as ContentType,
            data: qa as Record<string, unknown>,
          })
          set((s) => ({
            qas: s.qas.map((q) =>
              q.id === local.id
                ? { ...q, id: res.item.id, createdAt: res.item.createdAt }
                : q
            ),
          }))
        } catch { /* keep local */ }
      },

      deleteQA: async (id) => {
        set((s) => ({ qas: s.qas.filter((q) => q.id !== id) }))
        try { await contentApi.remove(id) } catch {}
      },

      // ── Vocab ────────────────────────────────────────────────────────────────

      addVocabWord: async (w) => {
        const local: CustomVocabWord = { ...w, id: uid(), createdAt: now() }
        set((s) => ({ vocabWords: [...s.vocabWords, local] }))
        try {
          const res = await contentApi.create({
            type: 'vocab_word' as ContentType,
            data: w as Record<string, unknown>,
          })
          set((s) => ({
            vocabWords: s.vocabWords.map((v) =>
              v.id === local.id
                ? { ...v, id: res.item.id, createdAt: res.item.createdAt }
                : v
            ),
          }))
        } catch { /* keep local */ }
      },

      deleteVocabWord: async (id) => {
        set((s) => ({ vocabWords: s.vocabWords.filter((w) => w.id !== id) }))
        try { await contentApi.remove(id) } catch {}
      },

      // ── Universities ──────────────────────────────────────────────────────────

      addUniversity: async (u) => {
        set((s) => ({ universities: [...s.universities, u] }))
        try {
          const { id, ...data } = u
          const res = await contentApi.create({
            type: 'university_entry' as ContentType,
            data: data as Record<string, unknown>,
          })
          set((s) => ({
            universities: s.universities.map((uni) =>
              uni.id === u.id ? { ...uni, id: res.item.id } : uni
            ),
          }))
        } catch { /* keep local */ }
      },

      deleteUniversity: async (id) => {
        set((s) => ({ universities: s.universities.filter((u) => u.id !== id) }))
        try { await contentApi.remove(id) } catch {}
      },

      // ── Scholarships ──────────────────────────────────────────────────────────

      addScholarship: async (s) => {
        set((st) => ({ scholarships: [...st.scholarships, s] }))
        try {
          const { id, ...data } = s
          const res = await contentApi.create({
            type: 'scholarship_entry' as ContentType,
            data: data as Record<string, unknown>,
          })
          set((st) => ({
            scholarships: st.scholarships.map((sch) =>
              sch.id === s.id ? { ...sch, id: res.item.id } : sch
            ),
          }))
        } catch { /* keep local */ }
      },

      deleteScholarship: async (id) => {
        set((s) => ({ scholarships: s.scholarships.filter((sch) => sch.id !== id) }))
        try { await contentApi.remove(id) } catch {}
      },
    }),
    { name: 'studyhub-content' },
  ),
)
