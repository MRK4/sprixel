import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'

const STORAGE_KEY = 'sprixel-locale'
const SUPPORTED_LANGUAGES = ['en', 'fr'] as const

function getStoredLanguage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function detectLanguage(): string {
  const stored = getStoredLanguage()
  if (stored && SUPPORTED_LANGUAGES.includes(stored as (typeof SUPPORTED_LANGUAGES)[number])) {
    return stored
  }
  const browserLang = navigator.language.split('-')[0]
  return SUPPORTED_LANGUAGES.includes(browserLang as (typeof SUPPORTED_LANGUAGES)[number])
    ? browserLang
    : 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'fr'],
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng)
    document.documentElement.lang = lng
  } catch {
    // ignore
  }
})

// Set initial lang attribute
document.documentElement.lang = i18n.language
