import { useState, useCallback, useEffect, useRef } from 'react'
import { MenuBar } from '../components/editor/MenuBar'
import { Toolbar } from '../components/editor/Toolbar'
import { ToolOptionsBar } from '../components/editor/ToolOptionsBar'
import { CanvasArea } from '../components/editor/CanvasArea'
import { LayersPanel } from '../components/editor/LayersPanel'
import type { Tool, Layer } from '../components/editor/types'
import { PALETTES, DEFAULT_PALETTE_ID } from '../data/palettes'

const DEFAULT_TOOL_OPTIONS = {
  brushSize: 1,
  pencilOpacity: 100,
  pixelPerfect: true,
  fillTolerance: 0,
}

const CANVAS_W = 32
const CANVAS_H = 32
const DEFAULT_ZOOM = 12

function makeLayer(name: string): Layer {
  return {
    id: crypto.randomUUID(),
    name,
    visible: true,
    opacity: 100,
    locked: false,
  }
}

export function HomePage() {
  const [activeTool, setActiveTool] = useState<Tool>('pencil')
  const [toolOptions, setToolOptions] = useState(DEFAULT_TOOL_OPTIONS)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [checkerboardSize, setCheckerboardSize] = useState<8 | 16 | 32>(16)
  const [layers, setLayers] = useState<Layer[]>(() => [makeLayer('Layer 1')])
  const [activeLayerId, setActiveLayerId] = useState<string>(() => layers[0].id)
  const [activeColor, setActiveColor] = useState('#000000')
  const [activePaletteId, setActivePaletteId] = useState(DEFAULT_PALETTE_ID)

  const viewportRef = useRef<HTMLDivElement>(null)
  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 2, 32)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 2, 1)), [])
  const zoomToFit = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const availW = el.clientWidth - 64
    const availH = el.clientHeight - 64
    if (availW <= 0 || availH <= 0) return
    const fitZoom = Math.min(availW / CANVAS_W, availH / CANVAS_H)
    const z = Math.max(1, Math.min(32, Math.floor(fitZoom)))
    setZoom(z)
  }, [])

  const addGroup = useCallback(() => {
    // TODO: implement layer groups
  }, [])

  const addLayer = useCallback(() => {
    const layer = makeLayer(`Layer ${layers.length + 1}`)
    setLayers((prev) => [layer, ...prev])
    setActiveLayerId(layer.id)
  }, [layers.length])

  const deleteLayer = useCallback((layerId?: string) => {
    const idToDelete = layerId ?? activeLayerId
    if (layers.length <= 1) return
    setLayers((prev) => {
      const next = prev.filter((l) => l.id !== idToDelete)
      setActiveLayerId(next[0].id)
      return next
    })
  }, [layers.length, activeLayerId])

  const updateLayer = useCallback((id: string, patch: Partial<Layer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }, [])

  const updateToolOptions = useCallback((patch: Partial<typeof DEFAULT_TOOL_OPTIONS>) => {
    setToolOptions((prev) => ({ ...prev, ...patch }))
  }, [])

  /* Keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 9) {
        const palette = PALETTES.find((p) => p.id === activePaletteId) ?? PALETTES[0]
        const color = palette.colors[num - 1]
        if (color) setActiveColor(color)
      }

      if (e.ctrlKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault()
        setCheckerboardSize((s) => (s === 8 ? 16 : s === 16 ? 32 : 8))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activePaletteId])

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none bg-(--color-bg) text-(--color-text)">
      <MenuBar
        checkerboardSize={checkerboardSize}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onCycleCheckerboardSize={() => setCheckerboardSize((s) => (s === 8 ? 16 : s === 16 ? 32 : 8))}
      />

      <div className="flex flex-1 overflow-hidden">
        <Toolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomToFit={zoomToFit}
          activeColor={activeColor}
        />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <ToolOptionsBar
            activeTool={activeTool}
            options={toolOptions}
            onOptionsChange={updateToolOptions}
          />
          <CanvasArea
            width={CANVAS_W}
            height={CANVAS_H}
            zoom={zoom}
            checkerboardSize={checkerboardSize}
            activeTool={activeTool}
            activeColor={activeColor}
            brushSize={toolOptions.brushSize}
            pencilOpacity={toolOptions.pencilOpacity}
            fillTolerance={toolOptions.fillTolerance}
            viewportRef={viewportRef}
          />
        </div>

        <LayersPanel
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={setActiveLayerId}
          onAddLayer={addLayer}
          onAddGroup={addGroup}
          onDeleteLayer={deleteLayer}
          onUpdateLayer={updateLayer}
          activeColor={activeColor}
          onColorChange={setActiveColor}
          activePaletteId={activePaletteId}
          onPaletteChange={setActivePaletteId}
          onImportPalette={() => { /* TODO: importer palette */ }}
          onAddColor={() => { /* TODO: ajouter couleur à la palette */ }}
        />
      </div>
    </div>
  )
}
