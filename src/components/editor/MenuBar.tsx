import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Undo, Redo, Copy, Cut, ZoomIn, ZoomOut, Download,
  Plus, Image, Flatten, Grid3x3,
} from 'pixelarticons/react'

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
  zoom: number
  showGrid: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleGrid: () => void
}

const ICON_SIZE = 14

export function MenuBar({ zoom, showGrid, onZoomIn, onZoomOut, onToggleGrid }: MenuBarProps) {
  const { i18n } = useTranslation()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const barRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!openMenu) return
    const close = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [openMenu])

  const menus: MenuDef[] = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', icon: <Plus width={ICON_SIZE} height={ICON_SIZE} /> },
        { label: 'Open…', shortcut: 'Ctrl+O', icon: <Image width={ICON_SIZE} height={ICON_SIZE} /> },
        { separator: true },
        { label: 'Save', shortcut: 'Ctrl+S' },
        { label: 'Save As…', shortcut: 'Ctrl+Shift+S' },
        { separator: true },
        { label: 'Export PNG', shortcut: 'Ctrl+E', icon: <Download width={ICON_SIZE} height={ICON_SIZE} /> },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', icon: <Undo width={ICON_SIZE} height={ICON_SIZE} /> },
        { label: 'Redo', shortcut: 'Ctrl+Y', icon: <Redo width={ICON_SIZE} height={ICON_SIZE} /> },
        { separator: true },
        { label: 'Cut', shortcut: 'Ctrl+X', icon: <Cut width={ICON_SIZE} height={ICON_SIZE} /> },
        { label: 'Copy', shortcut: 'Ctrl+C', icon: <Copy width={ICON_SIZE} height={ICON_SIZE} /> },
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
        { label: 'Zoom In', shortcut: 'Ctrl++', icon: <ZoomIn width={ICON_SIZE} height={ICON_SIZE} />, onClick: onZoomIn },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', icon: <ZoomOut width={ICON_SIZE} height={ICON_SIZE} />, onClick: onZoomOut },
        { separator: true },
        { label: showGrid ? 'Hide Grid' : 'Show Grid', shortcut: 'Ctrl+G', icon: <Grid3x3 width={ICON_SIZE} height={ICON_SIZE} />, onClick: onToggleGrid },
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
        { label: 'Flatten Layers', icon: <Flatten width={ICON_SIZE} height={ICON_SIZE} /> },
      ],
    },
  ]

  const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
  ] as const

  return (
    <header
      ref={barRef}
      className="flex items-center h-8 border-b border-(--color-border) bg-(--color-surface) shrink-0"
    >
      {/* App name */}
      <span className="px-3 text-xs font-bold text-(--color-accent) shrink-0 border-r border-(--color-border) h-full flex items-center">
        SPRIXEL
      </span>

      {/* Menus */}
      <nav className="flex items-center h-full">
        {menus.map((menu) => (
          <div key={menu.id} className="relative h-full">
            <button
              type="button"
              className={[
                'h-full px-3 text-xs cursor-pointer',
                'transition-colors duration-75',
                openMenu === menu.id
                  ? 'bg-(--color-accent) text-white'
                  : 'hover:bg-(--color-surface-alt) text-(--color-text)',
              ].join(' ')}
              onMouseDown={(e) => {
                e.stopPropagation()
                setOpenMenu(openMenu === menu.id ? null : menu.id)
              }}
            >
              {menu.label}
            </button>

            {openMenu === menu.id && (
              <div className="absolute top-full left-0 z-50 bg-(--color-surface) border border-(--color-border) min-w-44 py-1">
                {menu.items.map((item, i) =>
                  isSeparator(item) ? (
                    <div key={i} className="h-px bg-(--color-border) my-1 mx-1" />
                  ) : (
                    <button
                      key={i}
                      type="button"
                      disabled={item.disabled}
                      onClick={() => {
                        item.onClick?.()
                        setOpenMenu(null)
                      }}
                      className={[
                        'w-full flex items-center gap-2 px-3 h-7 text-xs text-left',
                        'hover:bg-(--color-surface-alt) disabled:opacity-40 disabled:cursor-not-allowed',
                        'cursor-pointer',
                      ].join(' ')}
                    >
                      <span className="w-4 flex items-center justify-center shrink-0 text-(--color-muted)">
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <span className="text-(--color-muted) text-[10px] ml-4 shrink-0">{item.shortcut}</span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Right side: zoom + version + lang */}
      <div className="ml-auto flex items-center gap-3 px-3 h-full border-l border-(--color-border)">
        <span className="text-xs text-(--color-muted) tabular-nums">×{zoom}</span>
        <span className="text-[10px] text-(--color-muted)">v{__APP_VERSION__}</span>
        <div className="flex items-center gap-1">
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => i18n.changeLanguage(code)}
              className={[
                'text-[10px] px-1.5 h-5 cursor-pointer border',
                'transition-colors duration-75',
                i18n.language.startsWith(code)
                  ? 'border-(--color-accent) text-(--color-accent)'
                  : 'border-transparent text-(--color-muted) hover:text-(--color-text)',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
