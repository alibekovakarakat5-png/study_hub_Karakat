import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { i18n } = useTranslation()
  const current = i18n.language.startsWith('en') ? 'en' : 'ru'

  return (
    <div className={`flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white/70 p-0.5 ${className}`}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
            current === code
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
