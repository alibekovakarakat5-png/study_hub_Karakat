import { useState } from 'react'
import { ownerRequest } from '@/lib/review'

export default function ReviewScreenshot({ id }: { id: string }) {
  const [image, setImage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function load() {
    setBusy(true); setError('')
    try {
      const value = await ownerRequest<{ record: { data: { dataUrl: string } } }>('GET', '/review/attachments/' + id)
      setImage(value.record.data.dataUrl)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  return <div className="space-y-2">
    {!image && <button className="text-blue-700 underline py-2" disabled={busy} onClick={() => void load()}>{busy ? 'Загружаем изображение…' : 'Открыть скриншот'}</button>}
    {image && <><img src={image} alt="Скриншот к замечанию" className="max-w-full rounded-lg border border-slate-200" /><a className="text-blue-700 underline" href={image} download={'review-' + id + (image.startsWith('data:image/png') ? '.png' : '.jpg')}>Скачать скриншот</a></>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
  </div>
}
