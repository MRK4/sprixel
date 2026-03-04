import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { PixelIcon } from '../icons/PixelIcon'
import { cn } from '../../lib/cn'

interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('Dialog components must be used within Dialog.Root')
  return ctx
}

/* --- Root --- */

interface DialogRootProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DialogRoot({ children, open: controlledOpen, onOpenChange }: DialogRootProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

/* --- Trigger --- */

interface DialogTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function DialogTrigger({ children, onClick, ...props }: DialogTriggerProps) {
  const { open, setOpen } = useDialog()

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={(e) => {
        onClick?.(e)
        setOpen(!open)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

/* --- Content --- */

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  onEscape?: () => void
}

export function DialogContent({
  children,
  className,
  onEscape,
  ...props
}: DialogContentProps) {
  const { open, setOpen } = useDialog()

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, setOpen, onEscape])

  const handleOverlayClick = () => setOpen(false)

  if (!open) return null

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        aria-hidden
        onClick={handleOverlayClick}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
          'bg-(--color-surface) border border-(--color-border)',
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </>,
    document.body
  )
}

/* --- Title --- */

export function DialogTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-sm font-medium text-(--color-text) px-3 pt-3', className)}
      {...props}
    >
      {children}
    </h2>
  )
}

/* --- Close --- */

interface DialogCloseProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
}

export function DialogClose({ children, className, ...props }: DialogCloseProps) {
  const { setOpen } = useDialog()

  return (
    <button
      type="button"
      aria-label="Fermer"
      onClick={() => setOpen(false)}
      className={cn(
        'w-7 h-7 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) transition-colors duration-75 cursor-pointer shrink-0',
        'focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2',
        className
      )}
      {...props}
    >
      {children ?? <PixelIcon icon="close" width={14} height={14} />}
    </button>
  )
}

/* --- Header --- */

export function DialogHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-start justify-between gap-2 pb-2', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/* --- Body --- */

export function DialogBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-3 pb-3', className)} {...props}>
      {children}
    </div>
  )
}

/* --- Footer --- */

export function DialogFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 px-3 pb-3 border-t border-(--color-border) pt-2', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/* --- Compound export --- */

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
  Close: DialogClose,
}
