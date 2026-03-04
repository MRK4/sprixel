import { useState, useRef, useLayoutEffect, useCallback, useEffect, type HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'

const GAP = 4
const DELAY_MS = 400

const tooltipBaseClasses = [
  'fixed z-[9999] px-4 py-2 text-[10px] font-medium min-w-48 max-w-[28rem] whitespace-normal',
  'bg-(--color-surface-alt) border border-(--color-border) text-(--color-text)',
  'pointer-events-none transition-opacity duration-75',
]

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  wrapperClassName?: string
  delayMs?: number
}

export const Tooltip = ({
  content,
  side = 'top',
  className,
  wrapperClassName,
  delayMs = DELAY_MS,
  children,
  ...props
}: TooltipProps) => {
  const [visible, setVisible] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(true), delayMs)
  }, [delayMs])

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setVisible(false)
  }, [])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return
    const trigger = triggerRef.current.getBoundingClientRect()
    const tooltip = tooltipRef.current.getBoundingClientRect()
    const tw = tooltip.width
    const th = tooltip.height

    let top: number
    let left: number

    switch (side) {
      case 'top':
        top = trigger.top - th - GAP
        left = trigger.left + trigger.width / 2 - tw / 2
        break
      case 'bottom':
        top = trigger.bottom + GAP
        left = trigger.left + trigger.width / 2 - tw / 2
        break
      case 'left':
        top = trigger.top + trigger.height / 2 - th / 2
        left = trigger.left - tw - GAP
        break
      case 'right':
        top = trigger.top + trigger.height / 2 - th / 2
        left = trigger.right + GAP
        break
      default:
        top = trigger.top - th - GAP
        left = trigger.left + trigger.width / 2 - tw / 2
    }

    tooltipRef.current.style.top = `${Math.max(GAP, Math.min(top, window.innerHeight - th - GAP))}px`
    tooltipRef.current.style.left = `${Math.max(GAP, Math.min(left, window.innerWidth - tw - GAP))}px`
    tooltipRef.current.style.opacity = '1'
  }, [visible, side])

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-flex', wrapperClassName)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      {visible &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            className={cn(tooltipBaseClasses, 'opacity-0', className)}
          >
            {content}
          </span>,
          document.body
        )}
    </div>
  )
}

Tooltip.displayName = 'Tooltip'
