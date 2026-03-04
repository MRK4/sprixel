import { useRef, useEffect, useState } from 'react'

interface CanvasAreaProps {
  width: number
  height: number
  zoom: number
  checkerboardSize: 8 | 16 | 32
  /** Ref attached to the canvas viewport container for zoom-to-fit measurement */
  viewportRef?: React.RefObject<HTMLDivElement | null>
}

const CHECKERBOARD_STYLES: Record<8 | 16 | 32, { size: string; position: string }> = {
  8: { size: '8px 8px', position: '0 0, 0 4px, 4px -4px, -4px 0px' },
  16: { size: '16px 16px', position: '0 0, 0 8px, 8px -8px, -8px 0px' },
  32: { size: '32px 32px', position: '0 0, 0 16px, 16px -16px, -16px 0px' },
}

export function CanvasArea({ width, height, zoom, checkerboardSize, viewportRef }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0, inside: false })

  const displayW = width * zoom
  const displayH = height * zoom

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
  }, [width, height])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.floor((e.clientX - rect.left) / zoom)
    const y = Math.floor((e.clientY - rect.top) / zoom)
    setCursor({
      x: Math.max(0, Math.min(x, width - 1)),
      y: Math.max(0, Math.min(y, height - 1)),
      inside: true,
    })
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
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setCursor((c) => ({ ...c, inside: false }))}
          />

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
