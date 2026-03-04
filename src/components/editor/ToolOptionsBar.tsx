import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Toggle, Separator, Tooltip } from '../ui'
import type { Tool } from './types'

export interface ToolOptions {
  brushSize: number
  pencilOpacity: number
  pixelPerfect: boolean
  fillTolerance: number
}

const BRUSH_SIZE_MIN = 1
const BRUSH_SIZE_MAX = 32

interface BrushSizeControlProps {
  value: number
  onChange: (v: number) => void
}

function BrushSizeControl({ value, onChange }: BrushSizeControlProps) {
  const [inputStr, setInputStr] = useState(String(value))

  useEffect(() => {
    setInputStr(String(value))
  }, [value])

  const handleSliderChange = (v: number) => {
    const clamped = Math.round(Math.max(BRUSH_SIZE_MIN, Math.min(BRUSH_SIZE_MAX, v)))
    onChange(clamped)
    setInputStr(String(clamped))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputStr(raw)
    const parsed = parseInt(raw, 10)
    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(BRUSH_SIZE_MIN, Math.min(BRUSH_SIZE_MAX, parsed))
      onChange(clamped)
    }
  }

  const handleInputBlur = () => {
    const parsed = parseInt(inputStr, 10)
    if (Number.isNaN(parsed) || parsed < BRUSH_SIZE_MIN) {
      setInputStr(String(BRUSH_SIZE_MIN))
      onChange(BRUSH_SIZE_MIN)
    } else if (parsed > BRUSH_SIZE_MAX) {
      setInputStr(String(BRUSH_SIZE_MAX))
      onChange(BRUSH_SIZE_MAX)
    } else {
      setInputStr(String(parsed))
      onChange(parsed)
    }
  }

  return (
    <div className="flex items-center gap-2 min-w-0 flex-1 max-w-48">
      <input
        type="range"
        min={BRUSH_SIZE_MIN}
        max={BRUSH_SIZE_MAX}
        step={1}
        value={value}
        onChange={(e) => handleSliderChange(e.target.valueAsNumber)}
        className="flex-1 h-2 min-w-0 appearance-none cursor-pointer bg-(--color-border) [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-(--color-accent) [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-(--color-accent)"
      />
      <input
        type="number"
        min={BRUSH_SIZE_MIN}
        max={BRUSH_SIZE_MAX}
        value={inputStr}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className="w-10 h-6 px-1.5 text-center text-xs tabular-nums bg-(--color-surface-alt) border border-(--color-border) text-(--color-text) focus:outline-none focus:shadow-[0_0_0_2px_var(--color-bg),0_0_0_4px_var(--color-accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  )
}

interface ToolOptionsBarProps {
  activeTool: Tool
  options: ToolOptions
  onOptionsChange: (patch: Partial<ToolOptions>) => void
}

export function ToolOptionsBar({ activeTool, options, onOptionsChange }: ToolOptionsBarProps) {
  const { t } = useTranslation()

  const toolsWithBrushSize: Tool[] = ['pencil', 'eraser']
  const toolsWithPencilOpacity: Tool[] = ['pencil']
  const toolsWithPixelPerfect: Tool[] = ['line', 'rect', 'ellipse']
  const toolsWithFillTolerance: Tool[] = ['fill']

  const showBrushSize = toolsWithBrushSize.includes(activeTool)
  const showPencilOpacity = toolsWithPencilOpacity.includes(activeTool)
  const showPixelPerfect = toolsWithPixelPerfect.includes(activeTool)
  const showFillTolerance = toolsWithFillTolerance.includes(activeTool)

  const hasOptions = showBrushSize || showPencilOpacity || showPixelPerfect || showFillTolerance

  if (!hasOptions) return null

  return (
    <div className="flex items-center gap-2 px-2 h-8 border-b border-(--color-border) bg-(--color-surface) shrink-0">
      {showBrushSize && (
        <>
          <span className="text-xs text-(--color-muted) shrink-0">
            {t('editor.toolOptions.brushSize')}:
          </span>
          <BrushSizeControl
            value={options.brushSize}
            onChange={(v) => onOptionsChange({ brushSize: v })}
          />
        </>
      )}

      {showPencilOpacity && (
        <>
          {(showBrushSize) && <Separator orientation="vertical" />}
          <span className="text-xs text-(--color-muted) shrink-0">
            {t('editor.toolOptions.opacity')}:
          </span>
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-32">
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={options.pencilOpacity}
              onChange={(e) => onOptionsChange({ pencilOpacity: Math.round(e.target.valueAsNumber) })}
              className="flex-1 h-2 min-w-0 appearance-none cursor-pointer bg-(--color-border) [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-(--color-accent) [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-(--color-accent)"
            />
            <span className="text-xs text-(--color-muted) tabular-nums shrink-0 w-8">
              {options.pencilOpacity}%
            </span>
          </div>
        </>
      )}

      {showBrushSize && showPixelPerfect && <Separator orientation="vertical" />}

      {showPixelPerfect && (
        <Tooltip content={t('editor.toolOptions.pixelPerfectHint')} side="bottom">
          <Toggle
            variant="tool"
            size="sm"
            pressed={options.pixelPerfect}
            onPressedChange={(p) => onOptionsChange({ pixelPerfect: p })}
          >
            {t('editor.toolOptions.pixelPerfect')}
          </Toggle>
        </Tooltip>
      )}

      {showFillTolerance && (
        <>
          {(showBrushSize || showPixelPerfect) && <Separator orientation="vertical" />}
          <div className="flex items-center gap-2 flex-1 min-w-0 max-w-48">
            <span className="text-xs text-(--color-muted) shrink-0">
              {t('editor.toolOptions.tolerance')}:
            </span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={options.fillTolerance}
                onChange={(e) => onOptionsChange({ fillTolerance: e.target.valueAsNumber })}
                className="flex-1 h-2 min-w-0 appearance-none cursor-pointer bg-(--color-border) [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-(--color-accent) [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-(--color-accent)"
              />
              <span className="text-xs text-(--color-muted) tabular-nums shrink-0 w-6">
                {options.fillTolerance}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
