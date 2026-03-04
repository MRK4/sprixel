import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
] as const

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 12, opacity: 0.7 }} title="Version">v{__APP_VERSION__}</span>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          style={{
            padding: '4px 8px',
            fontWeight: i18n.language.startsWith(code) ? 'bold' : 'normal',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
