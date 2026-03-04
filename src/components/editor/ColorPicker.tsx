import { useState, useEffect, useRef } from 'react'
import { hexToHsl, hslToHex, isValidHex } from '../../lib/color'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}

export function ColorPicker({ color, onChange, onClose, anchorRef }: ColorPickerProps) {
  const [hsl, setHsl] = useState<[number, number, number]>(() => hexToHsl(color))
  const [hexInput, setHexInput] = useState(color.toUpperCase())
  const popupRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const h = hexToHsl(color)
    setHsl(h)
    setHexInput(color.toUpperCase())
  }, [color])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const popup = popupRef.current
      const anchor = anchorRef.current
      if (
        popup && !popup.contains(e.target as Node) &&
        anchor && !anchor.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, anchorRef])

  const updateFromHsl = (h: number, s: number, l: number) => {
    const next: [number, number, number] = [h, s, l]
    setHsl(next)
    const hex = hslToHex(h, s, l)
    onChange(hex)
    setHexInput(hex.toUpperCase())
  }

  const handleHexInput = (value: string) => {
    setHexInput(value)
    const normalized = value.startsWith('#') ? value : `#${value}`
    if (isValidHex(normalized)) {
      onChange(normalized)
      setHsl(hexToHsl(normalized))
    }
  }

  const [h, s, l] = hsl
  const hueColor = hslToHex(h, 100, 50)
  const preview = hslToHex(h, s, l)

  return (
    <div
      ref={popupRef}
      className="absolute z-50 w-48 p-2.5 bg-(--color-surface) border border-(--color-border) shadow-lg flex flex-col gap-2.5"
      style={{ left: '100%', top: 0, marginLeft: 4 }}
    >
      {/* Preview */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 border border-(--color-border) shrink-0"
          style={{ background: preview }}
        />
        <div className="flex-1 relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-(--color-muted) select-none">#</span>
          <input
            type="text"
            value={hexInput.replace('#', '')}
            onChange={(e) => handleHexInput(`#${e.target.value}`)}
            maxLength={6}
            spellCheck={false}
            className="w-full h-7 pl-5 pr-2 text-xs font-mono bg-(--color-surface) border border-(--color-border) text-(--color-text) focus:outline-none focus:border-(--color-accent) uppercase"
          />
        </div>
      </div>

      {/* Hue slider */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-(--color-muted) uppercase tracking-wide">H</span>
        <div className="relative h-3">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            }}
          />
          <input
            type="range"
            min={0}
            max={360}
            value={h}
            onChange={(e) => updateFromHsl(e.target.valueAsNumber, s, l)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 border-2 border-white shadow"
            style={{
              left: `calc(${(h / 360) * 100}% - 5px)`,
              background: hueColor,
            }}
          />
        </div>
      </div>

      {/* Saturation slider */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-(--color-muted) uppercase tracking-wide">S</span>
        <div className="relative h-3">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${hslToHex(h, 0, l)}, ${hslToHex(h, 100, l)})`,
            }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={s}
            onChange={(e) => updateFromHsl(h, e.target.valueAsNumber, l)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 border-2 border-white shadow"
            style={{
              left: `calc(${s}% - 5px)`,
              background: hslToHex(h, s, l),
            }}
          />
        </div>
      </div>

      {/* Lightness slider */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-(--color-muted) uppercase tracking-wide">L</span>
        <div className="relative h-3">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, #000000, ${hslToHex(h, s, 50)}, #ffffff)`,
            }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={l}
            onChange={(e) => updateFromHsl(h, s, e.target.valueAsNumber)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 border-2 border-white shadow"
            style={{
              left: `calc(${l}% - 5px)`,
              background: hslToHex(h, s, l),
            }}
          />
        </div>
      </div>
    </div>
  )
}
