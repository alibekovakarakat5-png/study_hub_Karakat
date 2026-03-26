// ── Study Abroad hook — fetches country data from API ────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { studyAbroadApi, type StudyAbroadCountry } from '@/lib/api'

export function useStudyAbroadCountries() {
  const [countries, setCountries] = useState<StudyAbroadCountry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await studyAbroadApi.list()
      setCountries(res.countries)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { countries, loading, error, refetch: fetch }
}

export function useStudyAbroadCountry(code: string) {
  const [country, setCountry] = useState<StudyAbroadCountry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return
    setLoading(true)
    studyAbroadApi.get(code)
      .then(res => setCountry(res.country))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [code])

  return { country, loading, error }
}
