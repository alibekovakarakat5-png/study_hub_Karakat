import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'kk', label: 'ҚАЗ' },
  { code: 'ru', label: 'РУС' },
  { code: 'en', label: 'ENG' },
]

export function LanguageSwitcher({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  const { i18n } = useTranslation()
  const current = i18n.language.startsWith('en') ? 'en' : i18n.language.startsWith('kk') ? 'kk' : 'ru'

  return (
    <div className={`flex items-center gap-0.5 rounded-lg p-0.5 transition-colors ${
      dark
        ? 'border border-white/20 bg-white/10'
        : 'border border-gray-200 bg-white/70'
    } ${className}`}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
            current === code
              ? 'bg-primary-600 text-white shadow-sm'
              : dark
                ? 'text-white/60 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
