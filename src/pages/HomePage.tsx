import { useState, useCallback } from 'react'
import { MenuBar } from '../components/editor/MenuBar'
import { Toolbar } from '../components/editor/Toolbar'
import { CanvasArea } from '../components/editor/CanvasArea'
import { LayersPanel } from '../components/editor/LayersPanel'
import type { Tool, Layer } from '../components/editor/types'

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
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [showGrid, setShowGrid] = useState(true)
  const [layers, setLayers] = useState<Layer[]>(() => [makeLayer('Layer 1')])
  const [activeLayerId, setActiveLayerId] = useState<string>(() => layers[0].id)
  const [fgColor] = useState('#000000')
  const [bgColor] = useState('#ffffff')

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 2, 32)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 2, 1)), [])

  const addLayer = useCallback(() => {
    const layer = makeLayer(`Layer ${layers.length + 1}`)
    setLayers((prev) => [layer, ...prev])
    setActiveLayerId(layer.id)
  }, [layers.length])

  const deleteLayer = useCallback(() => {
    if (layers.length <= 1) return
    setLayers((prev) => {
      const next = prev.filter((l) => l.id !== activeLayerId)
      setActiveLayerId(next[0].id)
      return next
    })
  }, [layers.length, activeLayerId])

  const updateLayer = useCallback((id: string, patch: Partial<Layer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none bg-(--color-bg) text-(--color-text)">
      <MenuBar
        zoom={zoom}
        showGrid={showGrid}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onToggleGrid={() => setShowGrid((g) => !g)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Toolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          fgColor={fgColor}
          bgColor={bgColor}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
        />

        <CanvasArea
          width={CANVAS_W}
          height={CANVAS_H}
          zoom={zoom}
          showGrid={showGrid}
        />

        <LayersPanel
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={setActiveLayerId}
          onAddLayer={addLayer}
          onDeleteLayer={deleteLayer}
          onUpdateLayer={updateLayer}
        />
      </div>
    </div>
  )
}
