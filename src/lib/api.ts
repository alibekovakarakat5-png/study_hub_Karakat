// ── Token management ──────────────────────────────────────────────────────────

const TOKEN_KEY = 'studyhub-token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ── Base request ──────────────────────────────────────────────────────────────

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken()

  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Parse JSON even for error responses (server returns { error: string })
  const data = await res.json().catch(() => ({ error: res.statusText }))

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  return data as T
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  get:  <T>(path: string)                   => request<T>('GET',    path),
  post: <T>(path: string, body?: unknown)   => request<T>('POST',   path, body),
  put:  <T>(path: string, body?: unknown)   => request<T>('PUT',    path, body),
  del:  <T>(path: string)                   => request<T>('DELETE', path),
}

// ── Content API helpers ────────────────────────────────────────────────────────

export type ContentType =
  | 'ielts_material'
  | 'mentor_qa'
  | 'vocab_word'
  | 'ent_question'
  | 'curator_topic'

export interface ContentItem {
  id: string
  type: ContentType
  data: Record<string, unknown>
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export const contentApi = {
  /** Public: list active items (optionally filtered by type) */
  list: (type?: ContentType) =>
    api.get<{ items: ContentItem[] }>(`/content${type ? `?type=${type}` : ''}`),

  /** Admin: list all items including inactive */
  listAll: (type?: ContentType) =>
    api.get<{ items: ContentItem[] }>(`/content/all${type ? `?type=${type}` : ''}`),

  /** Admin: create new content item */
  create: (body: { type: ContentType; data: Record<string, unknown>; active?: boolean; order?: number }) =>
    api.post<{ item: ContentItem }>('/content', body),

  /** Admin: update content item */
  update: (id: string, body: Partial<{ type: ContentType; data: Record<string, unknown>; active: boolean; order: number }>) =>
    api.put<{ item: ContentItem }>(`/content/${id}`, body),

  /** Admin: delete content item */
  remove: (id: string) =>
    api.del<{ ok: boolean }>(`/content/${id}`),
}
