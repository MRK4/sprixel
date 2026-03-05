import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PixelIcon } from '../icons/PixelIcon'
import { DropdownMenu } from '../ui'

const THEME_KEY = 'sprixel-theme'

function getTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

function setTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_KEY, theme)
}

interface MenuAction {
  label: string
  shortcut?: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

interface MenuEntry {
  separator: true
}

type MenuItem = MenuAction | MenuEntry

function isSeparator(item: MenuItem): item is MenuEntry {
  return 'separator' in item
}

interface MenuDef {
  id: string
  label: string
  items: MenuItem[]
}

interface MenuBarProps {
  checkerboardSize: 8 | 16 | 32
  onZoomIn: () => void
  onZoomOut: () => void
  onCycleCheckerboardSize: () => void
}

const ICON_SIZE = 14

const CHECKERBOARD_KEYS: Record<8 | 16 | 32, string> = {
  8: 'editor.view.checkerboardSmall',
  16: 'editor.view.checkerboardMedium',
  32: 'editor.view.checkerboardLarge',
}

export function MenuBar({ checkerboardSize, onZoomIn, onZoomOut, onCycleCheckerboardSize }: MenuBarProps) {
  const { t, i18n } = useTranslation()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => getTheme())

  useEffect(() => {
    setThemeState(getTheme())
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setThemeState(next)
  }

  const menus: MenuDef[] = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', icon: <PixelIcon icon="plus" width={ICON_SIZE} height={ICON_SIZE} /> },
        { label: 'Open…', shortcut: 'Ctrl+O', icon: <PixelIcon icon="image" width={ICON_SIZE} height={ICON_SIZE} /> },
        { separator: true },
        { label: 'Save', shortcut: 'Ctrl+S', icon: <PixelIcon icon="save" width={ICON_SIZE} height={ICON_SIZE} /> },
        { label: 'Save As…', shortcut: 'Ctrl+Shift+S', icon: <PixelIcon icon="save" width={ICON_SIZE} height={ICON_SIZE} /> },
        { separator: true },
        { label: 'Export PNG', shortcut: 'Ctrl+E', icon: <PixelIcon icon="download" width={ICON_SIZE} height={ICON_SIZE} /> },
        { label: 'Export as…', icon: <PixelIcon icon="download" width={ICON_SIZE} height={ICON_SIZE} /> },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', icon: <PixelIcon icon="undo" width={ICON_SIZE} height={ICON_SIZE} /> },
        { label: 'Redo', shortcut: 'Ctrl+Y', icon: <PixelIcon icon="redo" width={ICON_SIZE} height={ICON_SIZE} /> },
        { separator: true },
        { label: 'Cut', shortcut: 'Ctrl+X', icon: <PixelIcon icon="cut" width={ICON_SIZE} height={ICON_SIZE} /> },
        { label: 'Copy', shortcut: 'Ctrl+C', icon: <PixelIcon icon="copy" width={ICON_SIZE} height={ICON_SIZE} /> },
        { label: 'Paste', shortcut: 'Ctrl+V' },
        { separator: true },
        { label: 'Select All', shortcut: 'Ctrl+A' },
        { label: 'Deselect', shortcut: 'Ctrl+D' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Zoom In', shortcut: 'Ctrl++', icon: <PixelIcon icon="zoom-in" width={ICON_SIZE} height={ICON_SIZE} />, onClick: onZoomIn },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', icon: <PixelIcon icon="zoom-out" width={ICON_SIZE} height={ICON_SIZE} />, onClick: onZoomOut },
        { separator: true },
        { label: t(CHECKERBOARD_KEYS[checkerboardSize]), shortcut: 'Ctrl+G', icon: <PixelIcon icon="chess" width={ICON_SIZE} height={ICON_SIZE} />, onClick: onCycleCheckerboardSize },
      ],
    },
    {
      id: 'image',
      label: 'Image',
      items: [
        { label: 'Resize Canvas…' },
        { label: 'Flip Horizontal' },
        { label: 'Flip Vertical' },
        { separator: true },
        { label: 'Flatten Layers', icon: <PixelIcon icon="flatten" width={ICON_SIZE} height={ICON_SIZE} /> },
      ],
    },
  ]

  const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
  ] as const

  return (
    <header className="flex items-center h-8 border-b border-(--color-border) bg-(--color-surface) shrink-0">
      {/* App name */}
      <span className="px-3 text-xs font-bold text-(--color-accent) shrink-0 border-r border-(--color-border) h-full flex items-center">
        SPRIXEL
      </span>

      {/* Menus */}
      <nav className="flex items-center h-full">
        {menus.map((menu) => (
          <DropdownMenu.Root
            key={menu.id}
            open={openMenu === menu.id}
            onOpenChange={(o) => setOpenMenu(o ? menu.id : null)}
          >
            <DropdownMenu.Trigger
              className={[
                'h-8 px-3 text-xs cursor-pointer flex items-center justify-center',
                'transition-colors duration-75',
                openMenu === menu.id
                  ? 'bg-(--color-accent) text-white'
                  : 'hover:bg-(--color-surface-alt) text-(--color-text)',
              ].join(' ')}
            >
              {menu.label}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start" side="bottom">
              {menu.items.map((item, i) =>
                isSeparator(item) ? (
                  <DropdownMenu.Separator key={i} />
                ) : (
                  <DropdownMenu.Item
                    key={i}
                    icon={item.icon}
                    shortcut={item.shortcut}
                    disabled={item.disabled}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </DropdownMenu.Item>
                )
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ))}
      </nav>

      {/* Right side: version + theme + lang */}
      <div className="ml-auto flex items-center gap-3 px-3 h-full border-l border-(--color-border)">
        <span className="text-[10px] text-(--color-muted)">v{__APP_VERSION__}</span>
        <button
          type="button"
          onClick={toggleTheme}
          className="text-[10px] h-5 px-1.5 bg-(--color-surface-alt) border border-(--color-border) text-(--color-muted) cursor-pointer hover:text-(--color-text) transition-colors duration-75 flex items-center justify-center"
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {theme === 'dark' ? (
            <PixelIcon icon="sun" width={12} height={12} />
          ) : (
            <PixelIcon icon="moon" width={12} height={12} />
          )}
        </button>
        <DropdownMenu.Root open={langOpen} onOpenChange={setLangOpen}>
          <DropdownMenu.Trigger
            className="text-[10px] h-5 px-1.5 bg-(--color-surface-alt) border border-(--color-border) text-(--color-muted) cursor-pointer hover:text-(--color-text) transition-colors duration-75"
          >
            {LANGUAGES.find(({ code }) => i18n.language.startsWith(code))?.label ?? 'EN'}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" side="bottom">
            {LANGUAGES.map(({ code, label }) => (
              <DropdownMenu.Item
                key={code}
                onClick={() => i18n.changeLanguage(code)}
              >
                {label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
