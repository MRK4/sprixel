import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DropdownMenu, Tooltip } from '../ui'
import { PixelIcon } from '../icons/PixelIcon'
import { PALETTES } from '../../data/palettes'

const STORAGE_KEY = 'sprixel-palette-height'
const MIN_HEIGHT = 80
const MAX_HEIGHT = 400
const DEFAULT_HEIGHT = 120

function getStoredHeight(): number {
  try {
    const v = parseInt(localStorage.getItem(STORAGE_KEY) ?? '', 10)
    if (!isNaN(v) && v >= MIN_HEIGHT && v <= MAX_HEIGHT) return v
  } catch { /* ignore */ }
  return DEFAULT_HEIGHT
}

interface PaletteSectionProps {
  activePaletteId: string
  onPaletteChange: (id: string) => void
  onColorClick: (color: string) => void
  activeColor: string
  onImportPalette?: () => void
  onAddColor?: () => void
}

const ICON_SIZE = 14

export function PaletteSection({
  activePaletteId,
  onPaletteChange,
  onColorClick,
  activeColor,
  onImportPalette,
  onAddColor,
}: PaletteSectionProps) {
  const { t } = useTranslation()
  const palette = PALETTES.find((p) => p.id === activePaletteId) ?? PALETTES[0]
  const [height, setHeight] = useState(getStoredHeight)

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startH = height

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientY - startY
      const next = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startH - delta))
      setHeight(next)
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch { /* ignore */ }
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [height])

  return (
    <div className="group/palette flex flex-col border-t border-(--color-border) shrink-0 relative" style={{ height }}>
      {/* Resize handle — visible only on palette hover */}
      <div
        role="separator"
        aria-orientation="horizontal"
        className="absolute top-0 left-0 right-0 h-2 cursor-row-resize -mt-0.5 z-10 flex items-center justify-center group"
        onMouseDown={handleResizeStart}
      >
        <span className="w-8 h-0.5 bg-(--color-border) opacity-0 group-hover/palette:opacity-100 group-hover:bg-(--color-muted) transition-[opacity,background-color]" />
      </div>

      {/* Palette selector + actions */}
      <div className="shrink-0 px-1 pt-1 flex items-center gap-0.5">
        <div className="flex-1 min-w-0">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="w-full flex items-center justify-between px-1.5 h-6 text-[10px] text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) transition-colors duration-75 cursor-pointer">
              <span className="truncate leading-none">{palette.name}</span>
              <span className="text-[8px] opacity-60 shrink-0 ml-1">▾</span>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start" side="left">
              {PALETTES.map((p) => (
                <DropdownMenu.Item
                  key={p.id}
                  onClick={() => onPaletteChange(p.id)}
                  className={p.id === activePaletteId ? 'text-(--color-accent)' : ''}
                >
                  {p.name}
                  <span className="text-(--color-muted) text-[10px] ml-1 tabular-nums">({p.colors.length})</span>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
        <Tooltip content={t('editor.palette.import')} side="top">
          <button
            type="button"
            onClick={() => onImportPalette?.()}
            className="w-6 h-6 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) transition-colors duration-75 cursor-pointer shrink-0"
          >
            <PixelIcon icon="flatten" width={ICON_SIZE} height={ICON_SIZE} />
          </button>
        </Tooltip>
        <Tooltip content={t('editor.palette.addColor')} side="top">
          <button
            type="button"
            onClick={() => onAddColor?.()}
            className="w-6 h-6 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) transition-colors duration-75 cursor-pointer shrink-0"
          >
            <PixelIcon icon="plus" width={ICON_SIZE} height={ICON_SIZE} />
          </button>
        </Tooltip>
        </div>
      </div>

      {/* Color grid — scrollable */}
      <div className="flex-1 overflow-y-auto px-1 pb-1 mt-1">
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
        >
          {palette.colors.map((color, i) => {
            const isActive = color.toLowerCase() === activeColor.toLowerCase()
            return (
              <button
                key={`${color}-${i}`}
                type="button"
                title={color}
                onClick={() => onColorClick(color)}
                className="aspect-square cursor-pointer relative"
                style={{ background: color }}
              >
                {isActive && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white mix-blend-difference" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
