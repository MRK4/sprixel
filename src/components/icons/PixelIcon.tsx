import { Icon } from '@iconify/react'

const PREFIX = 'pixelarticons:'

export interface PixelIconProps {
  icon: string
  width?: number
  height?: number
  className?: string
}

/**
 * Renders a pixelarticons icon from Iconify.
 * Icon names use kebab-case, e.g. "brush", "zoom-in", "square-dashed-cursor".
 */
export function PixelIcon({ icon, width = 24, height = 24, className }: PixelIconProps) {
  const fullIcon = icon.includes(':') ? icon : `${PREFIX}${icon}`
  return <Icon icon={fullIcon} width={width} height={height} className={className} />
}
