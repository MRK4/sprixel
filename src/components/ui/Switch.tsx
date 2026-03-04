import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'relative w-9 h-5 shrink-0 rounded-full border border-transparent',
        'transition-[background-color] duration-75',
        'focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        checked ? 'bg-(--color-accent)' : 'bg-(--color-border)',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white',
          'transition-transform duration-75',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
)

Switch.displayName = 'Switch'
