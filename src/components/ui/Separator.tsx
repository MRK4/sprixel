import { type HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const separatorVariants = cva(
  'shrink-0 bg-(--color-border)',
  {
    variants: {
      orientation: {
        horizontal: 'w-full h-px my-1',
        vertical: 'w-px mx-1 self-stretch',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
)

export interface SeparatorProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation ?? 'horizontal'}
      className={cn(separatorVariants({ orientation }), className)}
      {...props}
    />
  )
)

Separator.displayName = 'Separator'
