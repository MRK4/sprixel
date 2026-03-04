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
  fillTolerance: number
  /** Ref attached to the canvas viewport container for zoom-to-fit measurement */
  viewportRef?: React.RefObject<HTMLDivElement | null>
}

type Selection =
  | { type: 'rect'; x: number; y: number; w: number; h: number }
  | { type: 'marquee'; points: { x: number; y: number }[]; mask: Set<string> }

function hexToRgba(hex: string): [number, number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
    255,
  ]
}

// Ray casting: odd crossings = inside
function pointInPolygon(px: number, py: number, points: { x: number; y: number }[]): boolean {
  const x = px + 0.5
  const y = py + 0.5
  let inside = false
  const n = points.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = points[i].x
    const yi = points[i].y
    const xj = points[j].x
    const yj = points[j].y
    if (yi === yj) continue
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function buildMarqueeMask(points: { x: number; y: number }[], width: number, height: number): Set<string> {
  const mask = new Set<string>()
  if (points.length < 3) return mask
  let minX = points[0].x
  let maxX = points[0].x
  let minY = points[0].y
  let maxY = points[0].y
  for (let i = 1; i < points.length; i++) {
    minX = Math.min(minX, points[i].x)
    maxX = Math.max(maxX, points[i].x)
    minY = Math.min(minY, points[i].y)
    maxY = Math.max(maxY, points[i].y)
  }
  const minPx = Math.max(0, Math.ceil(minX - 0.5))
  const maxPx = Math.min(width - 1, Math.floor(maxX - 0.5))
  const minPy = Math.max(0, Math.ceil(minY - 0.5))
  const maxPy = Math.min(height - 1, Math.floor(maxY - 0.5))
  for (let py = minPy; py <= maxPy; py++) {
    for (let px = minPx; px <= maxPx; px++) {
      if (pointInPolygon(px, py, points)) mask.add(`${px},${py}`)
    }
  }
  return mask
}

// Contour du masque (arêtes extérieures des pixels sélectionnés) pour l'overlay pixelisé
function getMaskContourSegments(mask: Set<string>): { x1: number; y1: number; x2: number; y2: number }[] {
  const segments: { x1: number; y1: number; x2: number; y2: number }[] = []
  const has = (px: number, py: number) => mask.has(`${px},${py}`)
  for (const key of mask) {
    const [px, py] = key.split(',').map(Number)
    if (!has(px, py - 1)) segments.push({ x1: px, y1: py, x2: px + 1, y2: py })
    if (!has(px, py + 1)) segments.push({ x1: px, y1: py + 1, x2: px + 1, y2: py + 1 })
    if (!has(px - 1, py)) segments.push({ x1: px, y1: py, x2: px, y2: py + 1 })
    if (!has(px + 1, py)) segments.push({ x1: px + 1, y1: py, x2: px + 1, y2: py + 1 })
  }
  return segments
}

const TOOLS_WITH_BRUSH_SIZE: Tool[] = ['pencil', 'eraser']

const CHECKERBOARD_STYLES: Record<8 | 16 | 32, { size: string; position: string }> = {
  8: { size: '8px 8px', position: '0 0, 0 4px, 4px -4px, -4px 0px' },
  16: { size: '16px 16px', position: '0 0, 0 8px, 8px -8px, -8px 0px' },
  32: { size: '32px 32px', position: '0 0, 0 16px, 16px -16px, -16px 0px' },
}

export function CanvasArea({ width, height, zoom, checkerboardSize, activeTool, activeColor, brushSize, pencilOpacity, fillTolerance, viewportRef }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPixel = useRef<{ x: number; y: number } | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0, inside: false })

  // Selection state
  const [selection, setSelection] = useState<Selection | null>(null)
  const selectionStart = useRef<{ x: number; y: number } | null>(null)
  const isSelecting = useRef(false)
  const lassoPoints = useRef<{ x: number; y: number }[]>([])
  const isLassoDrawing = useRef(false)
  const [lassoPreview, setLassoPreview] = useState<{ x: number; y: number }[] | null>(null)
  const isMoving = useRef(false)
  const moveStart = useRef<{ x: number; y: number } | null>(null)
  const moveBufferRef = useRef<
    | { type: 'rect'; data: ImageData; x: number; y: number; w: number; h: number }
    | { type: 'marquee'; pixels: { px: number; py: number; r: number; g: number; b: number; a: number }[] }
    | null
  >(null)
  const movePreviewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [moveOffset, setMoveOffset] = useState<{ dx: number; dy: number } | null>(null)
  const isMovingSelectionZone = useRef(false)
  const selectionZoneMoveStart = useRef<{ x: number; y: number } | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

  const displayW = width * zoom
  const displayH = height * zoom

  // Clear selection on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelection(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Dessiner la prévisualisation sur l'overlay quand moveOffset change
  useEffect(() => {
    if (moveOffset !== null) {
      drawMovePreviewOnOverlay(moveOffset.dx, moveOffset.dy)
    }
  }, [moveOffset])

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

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return null
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom
    return { x, y }
  }

  const getPixelCoordsFromClient = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return null
    const x = Math.floor((clientX - rect.left) / zoom)
    const y = Math.floor((clientY - rect.top) / zoom)
    return { x, y }
  }

  const isPointInSelection = (px: number, py: number) => {
    if (!selection) return false
    if (selection.type === 'rect') {
      return px >= selection.x && px < selection.x + selection.w && py >= selection.y && py < selection.y + selection.h
    }
    return selection.mask.has(`${px},${py}`)
  }

  // Dessine la prévisualisation sur un canvas overlay (sans modifier le canvas principal)
  const drawMovePreviewOnOverlay = (dx: number, dy: number) => {
    const overlay = movePreviewCanvasRef.current
    const ctx = overlay?.getContext('2d')
    const buffer = moveBufferRef.current
    if (!overlay || !ctx || !buffer) return

    ctx.clearRect(0, 0, width, height)
    if (buffer.type === 'rect') {
      const { data, x, y, w, h } = buffer
      ctx.putImageData(data, x + dx, y + dy)
    } else {
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data
      for (const { px, py, r, g, b, a } of buffer.pixels) {
        const nx = px + dx
        const ny = py + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = (ny * width + nx) * 4
          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = a
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }
  }

  // Applique le déplacement définitif sur le canvas principal (au relâchement)
  const applyMoveToCanvas = (dx: number, dy: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const buffer = moveBufferRef.current
    if (!canvas || !ctx || !buffer || !selection) return

    if (buffer.type === 'rect') {
      const { data, x, y, w, h } = buffer
      ctx.clearRect(x, y, w, h)
      ctx.putImageData(data, x + dx, y + dy)
    } else {
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data
      for (const { px, py } of buffer.pixels) {
        const idx = (py * width + px) * 4
        data[idx] = 0
        data[idx + 1] = 0
        data[idx + 2] = 0
        data[idx + 3] = 0
      }
      for (const { px, py, r, g, b, a } of buffer.pixels) {
        const nx = px + dx
        const ny = py + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = (ny * width + nx) * 4
          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = a
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }
  }

  const confirmMoveAndUpdateSelection = (dx: number, dy: number) => {
    if (!selection) return
    if (selection.type === 'rect') {
      setSelection({ type: 'rect', x: selection.x + dx, y: selection.y + dy, w: selection.w, h: selection.h })
    } else {
      const newMask = new Set<string>()
      for (const key of selection.mask) {
        const [px, py] = key.split(',').map(Number)
        const nx = px + dx
        const ny = py + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) newMask.add(`${nx},${ny}`)
      }
      if (newMask.size === 0) {
        setSelection(null)
      } else {
        setSelection({ type: 'marquee', points: selection.points.map((p) => ({ x: p.x + dx, y: p.y + dy })), mask: newMask })
      }
    }
  }

  // Apply canvas clip to the active selection region
  const applyClip = (ctx: CanvasRenderingContext2D) => {
    if (!selection) return
    ctx.beginPath()
    if (selection.type === 'rect') {
      ctx.rect(selection.x, selection.y, selection.w, selection.h)
    } else {
      if (selection.points.length < 3) return
      ctx.moveTo(selection.points[0].x, selection.points[0].y)
      for (let i = 1; i < selection.points.length; i++) {
        ctx.lineTo(selection.points[i].x, selection.points[i].y)
      }
      ctx.closePath()
    }
    ctx.clip()
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
    ctx.save()
    applyClip(ctx)
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
    ctx.restore()
  }

  const eraseLine = (x0: number, y0: number, x1: number, y1: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.save()
    applyClip(ctx)

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
    ctx.restore()
  }

  const fillFlood = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const idx = (y * width + x) * 4
    const seedR = data[idx]
    const seedG = data[idx + 1]
    const seedB = data[idx + 2]
    const seedA = data[idx + 3]
    const threshold = (fillTolerance / 100) * 255

    const isInSelection = (px: number, py: number): boolean => {
      if (!selection) return true
      if (selection.type === 'rect') {
        return px >= selection.x && px < selection.x + selection.w && py >= selection.y && py < selection.y + selection.h
      }
      return selection.mask.has(`${px},${py}`)
    }

    let minX = 0
    let maxX = width - 1
    let minY = 0
    let maxY = height - 1
    if (selection) {
      if (selection.type === 'rect') {
        minX = selection.x
        minY = selection.y
        maxX = selection.x + selection.w - 1
        maxY = selection.y + selection.h - 1
      } else if (selection.points.length >= 3) {
        minX = selection.points.reduce((a, p) => Math.min(a, p.x), width)
        maxX = selection.points.reduce((a, p) => Math.max(a, p.x), 0)
        minY = selection.points.reduce((a, p) => Math.min(a, p.y), height)
        maxY = selection.points.reduce((a, p) => Math.max(a, p.y), 0)
        minX = Math.max(0, minX)
        maxX = Math.min(width - 1, maxX)
        minY = Math.max(0, minY)
        maxY = Math.min(height - 1, maxY)
      }
    }

    const colorMatch = (r: number, g: number, b: number, a: number) => {
      if (fillTolerance === 0) {
        return r === seedR && g === seedG && b === seedB && a === seedA
      }
      return (
        Math.abs(r - seedR) <= threshold &&
        Math.abs(g - seedG) <= threshold &&
        Math.abs(b - seedB) <= threshold &&
        Math.abs(a - seedA) <= threshold
      )
    }

    if (!isInSelection(x, y)) return

    const [fillR, fillG, fillB, fillA] = hexToRgba(fillColor)
    const queue: [number, number][] = [[x, y]]
    const visited = new Uint8Array(width * height)
    visited[y * width + x] = 1
    const dirs: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]]

    while (queue.length > 0) {
      const [px, py] = queue.shift()!
      if (!isInSelection(px, py)) continue
      const i = (py * width + px) * 4
      data[i] = fillR
      data[i + 1] = fillG
      data[i + 2] = fillB
      data[i + 3] = fillA

      for (const [dx, dy] of dirs) {
        const nx = px + dx
        const ny = py + dy
        if (nx < minX || nx > maxX || ny < minY || ny > maxY) continue
        if (!isInSelection(nx, ny)) continue
        const vi = ny * width + nx
        if (visited[vi]) continue
        const ni = vi * 4
        if (!colorMatch(data[ni], data[ni + 1], data[ni + 2], data[ni + 3])) continue
        visited[vi] = 1
        queue.push([nx, ny])
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const translateSelectionZone = (dx: number, dy: number) => {
    setSelection((sel) => {
      if (!sel) return null
      if (sel.type === 'rect') {
        return { type: 'rect', x: sel.x + dx, y: sel.y + dy, w: sel.w, h: sel.h }
      }
      const newMask = new Set<string>()
      for (const key of sel.mask) {
        const [px, py] = key.split(',').map(Number)
        const nx = px + dx
        const ny = py + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) newMask.add(`${nx},${ny}`)
      }
      if (newMask.size === 0) return null
      return { type: 'marquee', points: sel.points.map((p) => ({ x: p.x + dx, y: p.y + dy })), mask: newMask }
    })
  }

  const handleViewportMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'hand') {
      const startX = e.clientX
      const startY = e.clientY
      const startPanX = panOffset.x
      const startPanY = panOffset.y
      const handlePanMove = (ev: MouseEvent) => {
        // Souris et toile dans la même direction (drag right = canvas right)
        setPanOffset({
          x: startPanX + ev.clientX - startX,
          y: startPanY + ev.clientY - startY,
        })
      }
      const handlePanUp = () => {
        setIsPanning(false)
        document.body.style.cursor = ''
        window.removeEventListener('mousemove', handlePanMove)
        window.removeEventListener('mouseup', handlePanUp)
      }
      setIsPanning(true)
      document.body.style.cursor = 'grabbing'
      window.addEventListener('mousemove', handlePanMove)
      window.addEventListener('mouseup', handlePanUp)
      return
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getPixelCoords(e)
    if (!coords) return

    if ((activeTool === 'select' || activeTool === 'marquee') && selection && isPointInSelection(coords.x, coords.y)) {
      isMovingSelectionZone.current = true
      selectionZoneMoveStart.current = coords
      const handleSelectionZoneMove = (ev: MouseEvent) => {
        const curr = getPixelCoordsFromClient(ev.clientX, ev.clientY)
        if (!curr || !selectionZoneMoveStart.current) return
        const dx = curr.x - selectionZoneMoveStart.current.x
        const dy = curr.y - selectionZoneMoveStart.current.y
        translateSelectionZone(dx, dy)
        selectionZoneMoveStart.current = curr
        setCursor({ x: curr.x, y: curr.y, inside: curr.x >= 0 && curr.x < width && curr.y >= 0 && curr.y < height })
      }
      const handleSelectionZoneUp = () => {
        isMovingSelectionZone.current = false
        selectionZoneMoveStart.current = null
        window.removeEventListener('mousemove', handleSelectionZoneMove)
        window.removeEventListener('mouseup', handleSelectionZoneUp)
      }
      window.addEventListener('mousemove', handleSelectionZoneMove)
      window.addEventListener('mouseup', handleSelectionZoneUp)
      return
    }

    if (activeTool === 'select') {
      isSelecting.current = true
      selectionStart.current = coords
      setSelection({ type: 'rect', x: coords.x, y: coords.y, w: 1, h: 1 })
      return
    }

    if (activeTool === 'marquee') {
      const canvasCoords = getCanvasCoords(e)
      if (!canvasCoords) return
      isLassoDrawing.current = true
      lassoPoints.current = [canvasCoords]
      setLassoPreview([canvasCoords])
      setSelection(null)
      return
    }

    if (activeTool === 'fill') {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      fillFlood(ctx, coords.x, coords.y, activeColor)
      return
    }

    if (activeTool === 'move' && selection) {
      if (isPointInSelection(coords.x, coords.y)) {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data

        if (selection.type === 'rect') {
          const { x, y, w, h } = selection
          moveBufferRef.current = { type: 'rect', data: ctx.getImageData(x, y, w, h), x, y, w, h }
          ctx.clearRect(x, y, w, h)
        } else {
          const pixels: { px: number; py: number; r: number; g: number; b: number; a: number }[] = []
          for (const key of selection.mask) {
            const [px, py] = key.split(',').map(Number)
            const idx = (py * width + px) * 4
            pixels.push({ px, py, r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] })
          }
          moveBufferRef.current = { type: 'marquee', pixels }
          for (const { px, py } of pixels) {
            const idx = (py * width + px) * 4
            data[idx] = 0
            data[idx + 1] = 0
            data[idx + 2] = 0
            data[idx + 3] = 0
          }
          ctx.putImageData(imageData, 0, 0)
        }

        isMoving.current = true
        moveStart.current = coords
        setMoveOffset({ dx: 0, dy: 0 })

        const handleMoveMove = (e: MouseEvent) => {
          const curr = getPixelCoordsFromClient(e.clientX, e.clientY)
          if (!curr || !moveStart.current) return
          const dx = curr.x - moveStart.current.x
          const dy = curr.y - moveStart.current.y
          drawMovePreviewOnOverlay(dx, dy)
          setMoveOffset({ dx, dy })
          setCursor({ x: curr.x, y: curr.y, inside: curr.x >= 0 && curr.x < width && curr.y >= 0 && curr.y < height })
        }
        const handleMoveUp = (e: MouseEvent) => {
          const curr = getPixelCoordsFromClient(e.clientX, e.clientY)
          if (curr && moveStart.current) {
            const dx = curr.x - moveStart.current.x
            const dy = curr.y - moveStart.current.y
            applyMoveToCanvas(dx, dy)
            confirmMoveAndUpdateSelection(dx, dy)
          }
          isMoving.current = false
          moveStart.current = null
          moveBufferRef.current = null
          setMoveOffset(null)
          window.removeEventListener('mousemove', handleMoveMove)
          window.removeEventListener('mouseup', handleMoveUp)
        }
        window.addEventListener('mousemove', handleMoveMove)
        window.addEventListener('mouseup', handleMoveUp)
      }
      return
    }

    if (activeTool !== 'pencil' && activeTool !== 'eraser') return
    isDrawing.current = true
    lastPixel.current = coords
    if (activeTool === 'pencil') drawLine(coords.x, coords.y, coords.x, coords.y)
    else eraseLine(coords.x, coords.y, coords.x, coords.y)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getPixelCoords(e)
    if (!coords) return
    setCursor({ x: coords.x, y: coords.y, inside: true })

    if (isSelecting.current && activeTool === 'select') {
      const start = selectionStart.current
      if (!start) return
      const x = Math.min(start.x, coords.x)
      const y = Math.min(start.y, coords.y)
      const w = Math.abs(coords.x - start.x) + 1
      const h = Math.abs(coords.y - start.y) + 1
      setSelection({ type: 'rect', x, y, w, h })
      return
    }

    if (isLassoDrawing.current && activeTool === 'marquee') {
      const canvasCoords = getCanvasCoords(e)
      if (!canvasCoords) return
      const pts = lassoPoints.current
      const last = pts[pts.length - 1]
      if (!last) return
      const dist = Math.hypot(canvasCoords.x - last.x, canvasCoords.y - last.y)
      if (dist < 0.3) return
      pts.push({ x: canvasCoords.x, y: canvasCoords.y })
      setLassoPreview([...pts])
      return
    }

    if (isDrawing.current && (activeTool === 'pencil' || activeTool === 'eraser')) {
      const prev = lastPixel.current ?? coords
      if (activeTool === 'pencil') drawLine(prev.x, prev.y, coords.x, coords.y)
      else eraseLine(prev.x, prev.y, coords.x, coords.y)
      lastPixel.current = coords
    }
  }

  const handleMouseUp = () => {
    if (isLassoDrawing.current && activeTool === 'marquee') {
      const pts = lassoPoints.current
      if (pts.length >= 3) {
        const mask = buildMarqueeMask(pts, width, height)
        setSelection({ type: 'marquee', points: [...pts], mask })
      }
      isLassoDrawing.current = false
      lassoPoints.current = []
      setLassoPreview(null)
    }
    isDrawing.current = false
    lastPixel.current = null
    isSelecting.current = false
    selectionStart.current = null
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Viewport */}
      <div
        ref={viewportRef}
        className="flex-1 min-h-0 min-w-0 flex items-center justify-center overflow-hidden bg-(--color-bg) p-8"
        style={{
          cursor:
            activeTool === 'hand' ? (isPanning ? 'grabbing' : 'grab') : undefined,
        }}
        onMouseDown={handleViewportMouseDown}
      >
        <div
          className="relative shrink-0"
          style={{
            width: displayW,
            height: displayH,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
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
              cursor:
                activeTool === 'hand'
                  ? isPanning
                    ? 'grabbing'
                    : 'grab'
                  : activeTool === 'move'
                    ? 'move'
                    : (activeTool === 'select' || activeTool === 'marquee') &&
                        selection &&
                        cursor.inside &&
                        isPointInSelection(cursor.x, cursor.y) &&
                        !isSelecting.current &&
                        !isLassoDrawing.current
                      ? 'move'
                      : activeTool === 'select' || activeTool === 'marquee'
                        ? 'crosshair'
                        : 'default',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              isDrawing.current = false
              lastPixel.current = null
              isSelecting.current = false
              selectionStart.current = null
              isLassoDrawing.current = false
              lassoPoints.current = []
              setLassoPreview(null)
              setCursor((c) => ({ ...c, inside: false }))
            }}
          />

          {/* Prévisualisation du déplacement — overlay sans modifier le canvas principal */}
          {moveOffset !== null && (
            <canvas
              ref={movePreviewCanvasRef}
              width={width}
              height={height}
              className="absolute pointer-events-none"
              style={{
                left: 0,
                top: 0,
                width: displayW,
                height: displayH,
                imageRendering: 'pixelated',
                zIndex: 2,
              }}
            />
          )}

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

          {/* Selection overlay */}
          {selection?.type === 'rect' && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: (selection.x + (moveOffset?.dx ?? 0)) * zoom,
                top: (selection.y + (moveOffset?.dy ?? 0)) * zoom,
                width: selection.w * zoom,
                height: selection.h * zoom,
                outline: '1px dashed rgba(255,255,255,0.8)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
                zIndex: 3,
              }}
            />
          )}
          {/* Lasso preview while drawing */}
          {lassoPreview && lassoPreview.length >= 2 && (
            <svg
              className="absolute pointer-events-none"
              width={displayW}
              height={displayH}
              style={{ left: 0, top: 0, zIndex: 3 }}
            >
              <polyline
                points={lassoPreview.map((p) => `${p.x * zoom + 0.5},${p.y * zoom + 0.5}`).join(' ')}
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
            </svg>
          )}
          {selection?.type === 'marquee' && selection.mask.size > 0 && (
            <svg
              className="absolute pointer-events-none"
              width={displayW}
              height={displayH}
              style={{ left: 0, top: 0, zIndex: 3 }}
            >
              <path
                d={getMaskContourSegments(selection.mask)
                  .map((s) => {
                    const ox = moveOffset?.dx ?? 0
                    const oy = moveOffset?.dy ?? 0
                    return `M ${(s.x1 + ox) * zoom} ${(s.y1 + oy) * zoom} L ${(s.x2 + ox) * zoom} ${(s.y2 + oy) * zoom}`
                  })
                  .join(' ')}
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-3 h-6 border-t border-(--color-border) bg-(--color-surface) text-xs text-(--color-muted) shrink-0 tabular-nums">
        <span>{width}×{height} px</span>
        {cursor.inside && (
          <span>{cursor.x}, {cursor.y}</span>
        )}
        {selection && (
          <span className="ml-auto">
            Sélection : {selection.type === 'rect'
              ? `${selection.w}×${selection.h} px`
              : `${selection.mask.size} px`}
          </span>
        )}
      </div>
    </div>
  )
}
