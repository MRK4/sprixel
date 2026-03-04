import {
  Brush, Delete, Flatten, Pipette,
  SquareDashedCursor, CursorMinimal, Square, SplineCursor,
  ZoomIn, ZoomOut,
} from 'pixelarticons/react'
import { Toggle, Separator } from '../ui'
import type { Tool } from './types'

interface ToolbarProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  fgColor: string
  bgColor: string
  onZoomIn: () => void
  onZoomOut: () => void
}

const ICON_SIZE = 16

const TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: 'pencil',     icon: <Brush width={ICON_SIZE} height={ICON_SIZE} />,              label: 'Pencil (P)' },
  { id: 'eraser',     icon: <Delete width={ICON_SIZE} height={ICON_SIZE} />,             label: 'Eraser (E)' },
  { id: 'fill',       icon: <Flatten width={ICON_SIZE} height={ICON_SIZE} />,            label: 'Fill (F)' },
  { id: 'eyedropper', icon: <Pipette width={ICON_SIZE} height={ICON_SIZE} />,            label: 'Eyedropper (I)' },
  { id: 'select',     icon: <SquareDashedCursor width={ICON_SIZE} height={ICON_SIZE} />, label: 'Select (S)' },
  { id: 'move',       icon: <CursorMinimal width={ICON_SIZE} height={ICON_SIZE} />,      label: 'Move (M)' },
  { id: 'line',       icon: <SplineCursor width={ICON_SIZE} height={ICON_SIZE} />,       label: 'Line (L)' },
  { id: 'rect',       icon: <Square width={ICON_SIZE} height={ICON_SIZE} />,             label: 'Rectangle (R)' },
]

export function Toolbar({ activeTool, onToolChange, fgColor, bgColor, onZoomIn, onZoomOut }: ToolbarProps) {
  return (
    <aside className="flex flex-col items-center py-1.5 gap-0.5 border-r border-(--color-border) bg-(--color-surface) shrink-0">
      {/* Drawing tools */}
      {TOOLS.map((tool) => (
        <Toggle
          key={tool.id}
          variant="tool"
          size="icon_sm"
          pressed={activeTool === tool.id}
          onPressedChange={() => onToolChange(tool.id)}
          title={tool.label}
        >
          {tool.icon}
        </Toggle>
      ))}

      <Separator orientation="horizontal" className="w-6 my-0.5" />

      {/* Zoom */}
      <button
        type="button"
        title="Zoom In (Ctrl++)"
        onClick={onZoomIn}
        className="w-7 h-7 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) cursor-pointer transition-colors duration-75"
      >
        <ZoomIn width={ICON_SIZE} height={ICON_SIZE} />
      </button>
      <button
        type="button"
        title="Zoom Out (Ctrl+-)"
        onClick={onZoomOut}
        className="w-7 h-7 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) cursor-pointer transition-colors duration-75"
      >
        <ZoomOut width={ICON_SIZE} height={ICON_SIZE} />
      </button>

      {/* Color swatches */}
      <div className="mt-auto mb-1 relative w-8 h-8">
        {/* BG swatch (back) */}
        <div
          className="absolute top-2 left-2 w-5 h-5 border border-(--color-border) cursor-pointer"
          style={{ background: bgColor }}
          title={`Background: ${bgColor}`}
        />
        {/* FG swatch (front) */}
        <div
          className="absolute top-0 left-0 w-5 h-5 border border-(--color-border) cursor-pointer"
          style={{ background: fgColor }}
          title={`Foreground: ${fgColor}`}
        />
      </div>
    </aside>
  )
}
