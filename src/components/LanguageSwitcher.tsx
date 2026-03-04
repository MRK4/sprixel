import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
] as const

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="absolute top-4 right-4 flex items-center gap-3">
      <span className="text-xs opacity-70" title="Version">v{__APP_VERSION__}</span>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          className={`px-2 py-1 ${i18n.language.startsWith(code) ? 'font-bold' : 'font-normal'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
