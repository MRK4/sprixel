import { type HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const panelVariants = cva(
  'flex gap-1',
  {
    variants: {
      variant: {
        default: 'bg-(--color-surface) border border-(--color-border)',
        floating: 'bg-(--color-surface) border border-(--color-border)',
      },
      direction: {
        horizontal: 'flex-row items-center p-1.5',
        vertical: 'flex-col items-stretch p-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      direction: 'horizontal',
    },
  }
)

export interface PanelProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof panelVariants> {}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant, direction, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(panelVariants({ variant, direction }), className)}
      {...props}
    />
  )
)

Panel.displayName = 'Panel'
