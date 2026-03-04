import { Eye, EyeOff, Lock, Unlock, Plus, Delete } from 'pixelarticons/react'
import { Slider, Button } from '../ui'
import type { Layer } from './types'

interface LayersPanelProps {
  layers: Layer[]
  activeLayerId: string
  onSelectLayer: (id: string) => void
  onAddLayer: () => void
  onDeleteLayer: () => void
  onUpdateLayer: (id: string, patch: Partial<Layer>) => void
}

interface LayerItemProps {
  layer: Layer
  isActive: boolean
  onSelect: () => void
  onUpdate: (patch: Partial<Layer>) => void
}

const ICON_SIZE = 14

function LayerItem({ layer, isActive, onSelect, onUpdate }: LayerItemProps) {
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
      <button
        type="button"
        title={layer.visible ? 'Hide layer' : 'Show layer'}
        onClick={(e) => { e.stopPropagation(); onUpdate({ visible: !layer.visible }) }}
        className="w-6 h-6 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) cursor-pointer shrink-0 transition-colors duration-75"
      >
        {layer.visible
          ? <Eye width={ICON_SIZE} height={ICON_SIZE} />
          : <EyeOff width={ICON_SIZE} height={ICON_SIZE} />
        }
      </button>

      {/* Thumbnail placeholder */}
      <div
        className="w-6 h-6 shrink-0 border border-(--color-border)"
        style={{ background: layer.visible ? '#fff2' : 'transparent' }}
      />

      {/* Name */}
      <span className={['text-xs flex-1 truncate', layer.visible ? '' : 'opacity-40'].join(' ')}>
        {layer.name}
      </span>

      {/* Lock */}
      <button
        type="button"
        title={layer.locked ? 'Unlock layer' : 'Lock layer'}
        onClick={(e) => { e.stopPropagation(); onUpdate({ locked: !layer.locked }) }}
        className="w-6 h-6 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) cursor-pointer shrink-0 transition-colors duration-75"
      >
        {layer.locked
          ? <Lock width={ICON_SIZE} height={ICON_SIZE} />
          : <Unlock width={ICON_SIZE} height={ICON_SIZE} />
        }
      </button>
    </div>
  )
}

export function LayersPanel({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onDeleteLayer,
  onUpdateLayer,
}: LayersPanelProps) {
  const activeLayer = layers.find((l) => l.id === activeLayerId) ?? layers[0]

  return (
    <aside className="w-48 flex flex-col border-l border-(--color-border) bg-(--color-surface) shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-2 h-8 border-b border-(--color-border) shrink-0">
        <span className="text-xs font-medium uppercase tracking-wider text-(--color-muted)">Layers</span>
        <button
          type="button"
          title="Add layer"
          onClick={onAddLayer}
          className="w-6 h-6 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) cursor-pointer transition-colors duration-75"
        >
          <Plus width={ICON_SIZE} height={ICON_SIZE} />
        </button>
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
          />
        ))}
      </div>

      {/* Footer: opacity + delete */}
      <div className="flex flex-col gap-2 p-2 border-t border-(--color-border) shrink-0">
        <Slider
          label="Opacity"
          value={activeLayer.opacity}
          min={0}
          max={100}
          showValue
          onChange={(v) => onUpdateLayer(activeLayerId, { opacity: v })}
        />
        <Button
          variant="danger"
          size="sm"
          onClick={onDeleteLayer}
          disabled={layers.length <= 1}
          className="w-full"
        >
          <Delete width={ICON_SIZE} height={ICON_SIZE} />
          Delete layer
        </Button>
      </div>
    </aside>
  )
}
