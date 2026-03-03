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

      // ── Sync from server ────────────────────────────────────────────────────

      syncFromServer: async () => {
        try {
          const [matRes, qaRes, vocabRes] = await Promise.all([
            contentApi.list('ielts_material'),
            contentApi.list('mentor_qa'),
            contentApi.list('vocab_word'),
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

          set({ materials, qas, vocabWords })
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
          // Replace optimistic ID with real server ID
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
    }),
    { name: 'studyhub-content' },
  ),
)
