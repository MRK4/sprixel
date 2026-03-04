import { useState, useRef, useEffect } from 'react'
import { PixelIcon } from '../icons/PixelIcon'
import { useTranslation } from 'react-i18next'
import { Slider, IconButton, Tooltip } from '../ui'
import { PaletteSection } from './PaletteSection'
import type { Layer } from './types'

interface LayersPanelProps {
  layers: Layer[]
  activeLayerId: string
  onSelectLayer: (id: string) => void
  onAddLayer: () => void
  onAddGroup?: () => void
  onDeleteLayer: (layerId?: string) => void
  onUpdateLayer: (id: string, patch: Partial<Layer>) => void
  activeColor: string
  onColorChange: (color: string) => void
  activePaletteId: string
  onPaletteChange: (id: string) => void
  onImportPalette?: () => void
  onAddColor?: () => void
}

interface LayerItemProps {
  layer: Layer
  isActive: boolean
  onSelect: () => void
  onUpdate: (patch: Partial<Layer>) => void
  onDelete: () => void
  canDelete: boolean
}

const ICON_SIZE = 14

function LayerItem({ layer, isActive, onSelect, onUpdate, onDelete, canDelete }: LayerItemProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(layer.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      setEditValue(layer.name)
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing, layer.name])

  const commitRename = () => {
    const name = editValue.trim() || layer.name
    if (name !== layer.name) onUpdate({ name })
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitRename()
    }
    if (e.key === 'Escape') {
      setEditValue(layer.name)
      setIsEditing(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div
      onClick={onSelect}
      className={[
        'flex items-center gap-1.5 px-1.5 h-10 cursor-pointer border-b border-(--color-border)',
        'transition-colors duration-75',
        isActive
          ? 'bg-(--color-surface-alt) border-l-2 border-l-(--color-accent)'
          : 'border-l-2 border-l-transparent hover:bg-(--color-surface-alt)',
      ].join(' ')}
    >
      {/* Visibility */}
      <Tooltip content={layer.visible ? t('editor.layers.hideLayer') : t('editor.layers.showLayer')} side="left">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUpdate({ visible: !layer.visible }) }}
          className="w-6 h-6 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) cursor-pointer shrink-0 transition-colors duration-75"
        >
        {layer.visible
          ? <PixelIcon icon="eye" width={ICON_SIZE} height={ICON_SIZE} />
          : <PixelIcon icon="eye-off" width={ICON_SIZE} height={ICON_SIZE} />
        }
        </button>
      </Tooltip>

      {/* Thumbnail placeholder */}
      <div
        className="w-6 h-6 shrink-0 border border-(--color-border)"
        style={{ background: layer.visible ? '#fff2' : 'transparent' }}
      />

      {/* Name */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 text-[10px] px-0.5 py-0 bg-transparent border border-(--color-accent) rounded focus:outline-none"
        />
      ) : (
        <span
          className={['text-[10px] flex-1 truncate', layer.visible ? '' : 'opacity-40'].join(' ')}
          onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
        >
          {layer.name}
        </span>
      )}

      {/* Lock */}
      <Tooltip content={layer.locked ? t('editor.layers.unlockLayer') : t('editor.layers.lockLayer')} side="left">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUpdate({ locked: !layer.locked }) }}
          className="w-6 h-6 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) cursor-pointer shrink-0 transition-colors duration-75"
        >
        {layer.locked
          ? <PixelIcon icon="lock" width={ICON_SIZE} height={ICON_SIZE} />
          : <PixelIcon icon="unlock" width={ICON_SIZE} height={ICON_SIZE} />
        }
        </button>
      </Tooltip>

      {/* Delete */}
      <Tooltip content={t('editor.layers.delete')} side="left">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          disabled={!canDelete}
          className="w-6 h-6 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 transition-colors duration-75"
        >
          <PixelIcon icon="trash" width={ICON_SIZE} height={ICON_SIZE} />
        </button>
      </Tooltip>
    </div>
  )
}

export function LayersPanel({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onAddGroup,
  onDeleteLayer,
  onUpdateLayer,
  activeColor,
  onColorChange,
  activePaletteId,
  onPaletteChange,
  onImportPalette,
  onAddColor,
}: LayersPanelProps) {
  const { t } = useTranslation()
  const activeLayer = layers.find((l) => l.id === activeLayerId) ?? layers[0]

  return (
    <aside className="w-48 flex flex-col border-l border-(--color-border) bg-(--color-surface) shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-2 h-8 border-b border-(--color-border) shrink-0">
        <span className="text-xs font-medium uppercase tracking-wider text-(--color-muted)">Layers</span>
        <Tooltip content={t('editor.layers.add')} side="left">
          <button
            type="button"
            onClick={onAddLayer}
            className="w-6 h-6 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) cursor-pointer transition-colors duration-75"
          >
            <PixelIcon icon="plus" width={ICON_SIZE} height={ICON_SIZE} />
          </button>
        </Tooltip>
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto">
        {layers.map((layer) => (
          <LayerItem
            key={layer.id}
            layer={layer}
            isActive={layer.id === activeLayerId}
            onSelect={() => onSelectLayer(layer.id)}
            onUpdate={(patch) => onUpdateLayer(layer.id, patch)}
            onDelete={() => onDeleteLayer(layer.id)}
            canDelete={layers.length > 1}
          />
        ))}
      </div>

      {/* Footer: opacity + action buttons */}
      <div className="flex flex-col gap-2 p-2 border-t border-(--color-border) shrink-0">
        <Slider
          label="Opacity"
          value={activeLayer.opacity}
          min={0}
          max={100}
          showValue
          onChange={(v) => onUpdateLayer(activeLayerId, { opacity: v })}
        />
        <div className="flex items-center justify-between gap-0.5">
          <Tooltip content={t('editor.layers.addGroup')} side="top">
            <IconButton
              size="sm"
              variant="ghost"
              onClick={onAddGroup}
            >
              <PixelIcon icon="folder-plus" width={ICON_SIZE} height={ICON_SIZE} />
            </IconButton>
          </Tooltip>
          <Tooltip content={t('editor.layers.delete')} side="top">
            <IconButton
              size="sm"
              variant="ghost"
              onClick={() => onDeleteLayer()}
              disabled={layers.length <= 1}
            >
              <PixelIcon icon="trash" width={ICON_SIZE} height={ICON_SIZE} />
            </IconButton>
          </Tooltip>
          <Tooltip content={t('editor.layers.add')} side="top">
            <IconButton
              size="sm"
              variant="ghost"
              onClick={onAddLayer}
            >
              <PixelIcon icon="plus" width={ICON_SIZE} height={ICON_SIZE} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Palette */}
      <PaletteSection
        activePaletteId={activePaletteId}
        onPaletteChange={onPaletteChange}
        onColorClick={onColorChange}
        activeColor={activeColor}
        onImportPalette={onImportPalette}
        onAddColor={onAddColor}
      />
    </aside>
  )
}
