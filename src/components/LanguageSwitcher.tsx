import { useTranslation } from 'react-i18next'

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { i18n } = useTranslation()
  const isEn = i18n.language === 'en'

  const toggle = () => i18n.changeLanguage(isEn ? 'ru' : 'en')

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
        border border-gray-200 hover:border-blue-400 hover:bg-blue-50
        transition-all duration-200 ${className}`}
      title={isEn ? 'Switch to Russian' : 'Переключить на английский'}
    >
      <span className="text-base leading-none">{isEn ? '🇬🇧' : '🇷🇺'}</span>
      <span className="text-gray-600">{isEn ? 'EN' : 'RU'}</span>
    </button>
  )
}
