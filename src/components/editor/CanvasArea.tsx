import { useRef, useEffect, useState } from 'react'
import type { Tool } from './types'

interface CanvasAreaProps {
  width: number
  height: number
  zoom: number
  checkerboardSize: 8 | 16 | 32
  activeTool: Tool
  activeColor: string
  brushSize: number
  pencilOpacity: number
  /** Ref attached to the canvas viewport container for zoom-to-fit measurement */
  viewportRef?: React.RefObject<HTMLDivElement | null>
}

const TOOLS_WITH_BRUSH_SIZE: Tool[] = ['pencil', 'eraser']

const CHECKERBOARD_STYLES: Record<8 | 16 | 32, { size: string; position: string }> = {
  8: { size: '8px 8px', position: '0 0, 0 4px, 4px -4px, -4px 0px' },
  16: { size: '16px 16px', position: '0 0, 0 8px, 8px -8px, -8px 0px' },
  32: { size: '32px 32px', position: '0 0, 0 16px, 16px -16px, -16px 0px' },
}

export function CanvasArea({ width, height, zoom, checkerboardSize, activeTool, activeColor, brushSize, pencilOpacity, viewportRef }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPixel = useRef<{ x: number; y: number } | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0, inside: false })

  const displayW = width * zoom
  const displayH = height * zoom

  const getPixelCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return null
    const x = Math.floor((e.clientX - rect.left) / zoom)
    const y = Math.floor((e.clientY - rect.top) / zoom)
    return {
      x: Math.max(0, Math.min(x, width - 1)),
      y: Math.max(0, Math.min(y, height - 1)),
    }
  }

  const drawPixel = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillRect(x, y, brushSize, brushSize)
  }

  const erasePixel = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.clearRect(x, y, brushSize, brushSize)
  }

  // Bresenham's line algorithm — draws all pixels between two points
  const drawLine = (x0: number, y0: number, x1: number, y1: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = activeColor
    ctx.globalAlpha = pencilOpacity / 100

    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy
    let x = x0
    let y = y0

    while (true) {
      drawPixel(ctx, x, y)
      if (x === x1 && y === y1) break
      const e2 = 2 * err
      if (e2 > -dy) { err -= dy; x += sx }
      if (e2 < dx) { err += dx; y += sy }
    }
    ctx.globalAlpha = 1
  }

  const eraseLine = (x0: number, y0: number, x1: number, y1: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy
    let x = x0
    let y = y0

    while (true) {
      erasePixel(ctx, x, y)
      if (x === x1 && y === y1) break
      const e2 = 2 * err
      if (e2 > -dy) { err -= dy; x += sx }
      if (e2 < dx) { err += dx; y += sy }
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'pencil' && activeTool !== 'eraser') return
    isDrawing.current = true
    const coords = getPixelCoords(e)
    if (!coords) return
    lastPixel.current = coords
    if (activeTool === 'pencil') drawLine(coords.x, coords.y, coords.x, coords.y)
    else eraseLine(coords.x, coords.y, coords.x, coords.y)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getPixelCoords(e)
    if (!coords) return
    setCursor({ x: coords.x, y: coords.y, inside: true })
    if (isDrawing.current && (activeTool === 'pencil' || activeTool === 'eraser')) {
      const prev = lastPixel.current ?? coords
      if (activeTool === 'pencil') drawLine(prev.x, prev.y, coords.x, coords.y)
      else eraseLine(prev.x, prev.y, coords.x, coords.y)
      lastPixel.current = coords
    }
  }

  const handleMouseUp = () => {
    isDrawing.current = false
    lastPixel.current = null
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Viewport */}
      <div ref={viewportRef} className="flex-1 flex items-center justify-center overflow-auto bg-(--color-bg) p-8">
        <div className="relative shrink-0" style={{ width: displayW, height: displayH }}>
          {/* Transparency checkerboard */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                'linear-gradient(45deg, #444 25%, transparent 25%)',
                'linear-gradient(-45deg, #444 25%, transparent 25%)',
                'linear-gradient(45deg, transparent 75%, #444 75%)',
                'linear-gradient(-45deg, transparent 75%, #444 75%)',
              ].join(', '),
              backgroundSize: CHECKERBOARD_STYLES[checkerboardSize].size,
              backgroundPosition: CHECKERBOARD_STYLES[checkerboardSize].position,
              backgroundColor: '#666',
            }}
          />

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
              width: displayW,
              height: displayH,
              imageRendering: 'pixelated',
              display: 'block',
              position: 'relative',
              zIndex: 1,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { isDrawing.current = false; lastPixel.current = null; setCursor((c) => ({ ...c, inside: false })) }}
          />

          {/* Cursor size frame — only for tools with brushSize */}
          {cursor.inside && TOOLS_WITH_BRUSH_SIZE.includes(activeTool) && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: cursor.x * zoom,
                top: cursor.y * zoom,
                width: brushSize * zoom,
                height: brushSize * zoom,
                border: '1px solid var(--color-accent)',
                zIndex: 2,
              }}
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-3 h-6 border-t border-(--color-border) bg-(--color-surface) text-xs text-(--color-muted) shrink-0 tabular-nums">
        <span>{width}×{height} px</span>
        {cursor.inside && (
          <span>{cursor.x}, {cursor.y}</span>
        )}
      </div>
    </div>
  )
}
