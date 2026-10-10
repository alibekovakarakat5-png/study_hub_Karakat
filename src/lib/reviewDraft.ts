export type EvidenceDraft = {
  id: string; runId: string; stepId: string; path: string; sessionId: string; section: string;
  capturedAt: string; viewport: { width: number; height: number }; text: string;
  outcome: 'failed' | 'unclear'; screenshot?: { id: string; dataUrl: string }; frontendSha: string;
}
// IndexedDB avoids the small localStorage quota for image drafts. All records are owner/run scoped.
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('studyhub-review-drafts', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('drafts')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('Не удалось открыть хранилище черновика.'))
  })
}
export async function readEvidenceDraft(key: string): Promise<EvidenceDraft | null> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', 'readonly')
    const request = tx.objectStore('drafts').get(key)
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(new Error('Не удалось восстановить черновик.'))
    tx.oncomplete = () => db.close()
  })
}
export async function writeEvidenceDraft(key: string, value: EvidenceDraft | null) {
  const db = await database()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('drafts', 'readwrite')
    if (value) tx.objectStore('drafts').put(value, key)
    else tx.objectStore('drafts').delete(key)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onabort = tx.onerror = () => { db.close(); reject(new Error('Черновик не сохранён на устройстве. Не закрывайте страницу.')) }
  })
}
export async function prepareScreenshot(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 15 * 1024 * 1024) throw new Error('Выберите PNG или JPEG до 15 МБ.')
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    if (!image.width || !image.height || image.width * image.height > 80000000) throw new Error('Изображение слишком большое.')
    const scale = Math.min(1, 2000 / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Не удалось подготовить изображение.')
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    for (const quality of [0.9, 0.75, 0.6]) {
      const data = canvas.toDataURL('image/jpeg', quality)
      if (data.length < 1050000) return data
    }
    throw new Error('Изображение слишком большое. Обрежьте нужную область и прикрепите снова.')
  } finally { URL.revokeObjectURL(url) }
}
