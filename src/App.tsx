import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import './App.css'

function App() {
  const { t } = useTranslation()
  const [count, setCount] = useState(0)

  return (
    <>
      <LanguageSwitcher />
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>{t('app.viteReact')}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          {t('app.countIs', { count })}
        </button>
        <p>
          {t('app.editPart1')}<code>src/App.tsx</code>{t('app.editPart2')}
        </p>
      </div>
      <p className="read-the-docs">
        {t('app.clickLogos')}
      </p>
    </>
  )
}

export default App
