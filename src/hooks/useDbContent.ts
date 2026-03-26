// ── Universal hook for DB-driven content with hardcoded fallback ─────────────
//
// Usage:
//   const { data, loading, fromDb } = useDbContent({
//     contentType: 'curator_content',
//     fallbackData: hardcodedTopics,
//     transform: (item) => item.data as TopicContent,
//   })

import { useState, useEffect, useCallback, useRef } from 'react'
import { contentApi, type ContentItem, type ContentType } from '@/lib/api'

interface UseDbContentOptions<T> {
  contentType: ContentType
  fallbackData: T[]
  transform: (item: ContentItem) => T
  /** Whether to fetch on mount (default: true) */
  fetchOnMount?: boolean
  /** Max items to fetch (default: 200) */
  limit?: number
  /** Filter function on transformed items */
  filter?: (item: T) => boolean
}

interface UseDbContentReturn<T> {
  data: T[]
  loading: boolean
  fromDb: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDbContent<T>({
  contentType,
  fallbackData,
  transform,
  fetchOnMount = true,
  limit = 200,
  filter,
}: UseDbContentOptions<T>): UseDbContentReturn<T> {
  const [data, setData] = useState<T[]>(filter ? fallbackData.filter(filter) : fallbackData)
  const [loading, setLoading] = useState(false)
  const [fromDb, setFromDb] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await contentApi.list(contentType, { limit })
      if (!mountedRef.current) return

      if (res.items.length > 0) {
        let transformed = res.items.map(transform)
        if (filter) transformed = transformed.filter(filter)
        setData(transformed)
        setFromDb(true)
      }
      // If empty, keep fallback — this is the graceful degradation
    } catch (err: any) {
      if (!mountedRef.current) return
      setError(err.message)
      // Keep fallback data on error
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [contentType, limit, transform, filter])

  useEffect(() => {
    mountedRef.current = true
    if (fetchOnMount) fetch()
    return () => { mountedRef.current = false }
  }, [fetchOnMount, fetch])

  return { data, loading, fromDb, error, refetch: fetch }
}
