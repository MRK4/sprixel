import { type HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-sm',
  {
    variants: {
      variant: {
        default: 'bg-(--color-surface-alt) text-(--color-muted)',
        accent: 'bg-(--color-accent) text-white',
        danger: 'bg-(--color-danger) text-white',
        outline: 'bg-transparent border border-(--color-border) text-(--color-muted)',
      },
      size: {
        sm: 'text-[10px] px-1.5 h-4',
        md: 'text-xs px-2 h-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
)

Badge.displayName = 'Badge'
