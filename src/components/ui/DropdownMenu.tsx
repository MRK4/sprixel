import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type HTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext)
  if (!ctx) throw new Error('DropdownMenu components must be used within DropdownMenu.Root')
  return ctx
}

/* --- Root --- */

interface DropdownMenuRootProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DropdownMenuRoot({
  children,
  open: controlledOpen,
  onOpenChange,
}: DropdownMenuRootProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      const trigger = triggerRef.current
      const content = contentRef.current
      if (
        trigger?.contains(e.target as Node) ||
        content?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, isControlled, onOpenChange])

  return (
    <DropdownMenuContext.Provider
      value={{ open, setOpen, triggerRef, contentRef }}
    >
      <div className="relative inline-flex">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

/* --- Trigger --- */

interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function DropdownMenuTrigger({ children, className, ...props }: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownMenu()

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(e) => {
        e.stopPropagation()
        setOpen(!open)
      }}
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(className)}
      {...props}
    >
      {children}
    </button>
  )
}

/* --- Content --- */

interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function DropdownMenuContent({
  children,
  align = 'start',
  side = 'bottom',
  className,
  ...props
}: DropdownMenuContentProps) {
  const { open, contentRef, triggerRef } = useDropdownMenu()
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!open) { setPos(null); return }
    const trigger = triggerRef.current
    const content = contentRef.current
    if (!trigger || !content) return

    const t = trigger.getBoundingClientRect()
    const c = content.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    let top: number
    let left: number

    if (side === 'bottom') {
      top = t.bottom
      left = align === 'end' ? t.right - c.width : t.left
    } else if (side === 'top') {
      top = t.top - c.height
      left = align === 'end' ? t.right - c.width : t.left
    } else if (side === 'right') {
      top = t.top
      left = t.right
    } else {
      top = t.top
      left = t.left - c.width
    }

    left = Math.max(4, Math.min(left, vw - c.width - 4))
    top  = Math.max(4, Math.min(top,  vh - c.height - 4))

    setPos({ top, left })
  }, [open, side, align])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        'fixed z-50 py-1 min-w-64',
        'bg-(--color-surface) border border-(--color-border)',
        className
      )}
      style={{
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        visibility: pos ? 'visible' : 'hidden',
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/* --- Item --- */

interface DropdownMenuItemProps extends HTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
}

export function DropdownMenuItem({
  children,
  icon,
  shortcut,
  disabled,
  onClick,
  className,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu()

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      className={cn(
        'w-full flex items-center gap-2 px-3 h-7 text-xs text-left',
        'hover:bg-(--color-surface-alt) disabled:opacity-40 disabled:cursor-not-allowed',
        'cursor-pointer transition-colors duration-75',
        className
      )}
      {...props}
    >
      <span className="w-4 flex items-center justify-center shrink-0 text-(--color-muted)">
        {icon}
      </span>
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="text-(--color-muted) text-[10px] ml-4 shrink-0">{shortcut}</span>
      )}
    </button>
  )
}

/* --- Separator --- */

export function DropdownMenuSeparator() {
  return <div className="h-px bg-(--color-border) my-1 mx-1" role="separator" />
}

/* --- Compound export --- */

export const DropdownMenu = {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Separator: DropdownMenuSeparator,
}
