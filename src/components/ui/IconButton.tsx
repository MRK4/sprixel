import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const iconButtonVariants = cva(
  [
    'inline-flex items-center justify-center shrink-0 leading-none',
    'border cursor-pointer',
    'transition-[background-color,border-color,color] duration-75',
    'focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'select-none',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-transparent border-transparent text-(--color-text)',
          'hover:bg-(--color-surface-alt)',
          'active:opacity-80',
        ],
        ghost: [
          'bg-transparent border-transparent text-(--color-muted)',
          'hover:bg-(--color-surface-alt) hover:text-(--color-text)',
          'active:opacity-80',
        ],
        active: [
          'bg-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] border-(--color-accent) text-(--color-accent)',
          'hover:bg-[color-mix(in_srgb,var(--color-accent)_40%,transparent)]',
          'active:opacity-80',
        ],
      },
      size: {
        sm: 'w-7 h-7',
        md: 'w-9 h-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
)

IconButton.displayName = 'IconButton'
