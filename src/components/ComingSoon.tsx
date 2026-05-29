import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Rocket, ArrowLeft } from 'lucide-react'

// Polished placeholder for features that are on the roadmap but not yet
// functional. Used to retire demo-ware routes so a sales demo never lands
// on a page with dead buttons / fabricated data.

interface Props {
  title: string
  description?: string
  /** Optional bullet list of what's planned — shows the vision to buyers. */
  planned?: string[]
}

export default function ComingSoon({ title, description, planned }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-gray-100 p-8 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
          Скоро
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 leading-relaxed mb-6">
          {description ?? 'Этот раздел в активной разработке. Мы добавим его в одном из ближайших обновлений.'}
        </p>

        {planned && planned.length > 0 && (
          <div className="text-left bg-slate-50 rounded-2xl p-4 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Что планируем</p>
            <ul className="space-y-1.5">
              {planned.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </Link>
      </motion.div>
    </div>
  )
}
