import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const toggleVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium font-[inherit] leading-none cursor-pointer border select-none',
    'transition-[background-color,border-color,color] duration-75',
    'focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        default: '',
        tool: '',
      },
      size: {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-9 px-3.5 text-sm',
        icon_sm: 'w-7 h-7',
        icon_md: 'w-9 h-9',
      },
      pressed: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        pressed: false,
        className: [
          'bg-transparent border-transparent text-(--color-text)',
          'hover:bg-(--color-surface-alt)',
        ],
      },
      {
        variant: 'default',
        pressed: true,
        className: 'bg-(--color-surface-alt) border-(--color-border) text-(--color-text)',
      },
      {
        variant: 'tool',
        pressed: false,
        className: [
          'bg-transparent border-transparent text-(--color-muted)',
          'hover:bg-(--color-surface-alt) hover:text-(--color-text)',
        ],
      },
      {
        variant: 'tool',
        pressed: true,
        className: 'bg-[color-mix(in_srgb,var(--color-accent)_25%,transparent)] border-(--color-accent) text-(--color-accent)',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      pressed: false,
    },
  }
)

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>,
    Omit<VariantProps<typeof toggleVariants>, 'pressed'> {
  pressed: boolean
  onPressedChange?: (pressed: boolean) => void
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed, onPressedChange, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange?.(!pressed)}
      className={cn(toggleVariants({ variant, size, pressed }), className)}
      {...props}
    />
  )
)

Toggle.displayName = 'Toggle'
