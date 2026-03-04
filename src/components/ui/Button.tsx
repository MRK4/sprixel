import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium font-[inherit] leading-none cursor-pointer',
    'border',
    'transition-[background-color,border-color,color] duration-75',
    'focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-(--color-accent) border-(--color-accent) text-white',
          'hover:bg-(--color-accent-hover) hover:border-(--color-accent-hover)',
          'active:opacity-80',
        ],
        secondary: [
          'bg-transparent border-(--color-border) text-(--color-text)',
          'hover:bg-(--color-surface-alt)',
          'active:bg-(--color-surface-alt) active:opacity-80',
        ],
        ghost: [
          'bg-transparent border-transparent text-(--color-text)',
          'hover:bg-(--color-surface-alt)',
          'active:opacity-80',
        ],
        danger: [
          'bg-(--color-danger) border-(--color-danger) text-white',
          'hover:bg-(--color-danger-hover) hover:border-(--color-danger-hover)',
          'active:opacity-80',
        ],
      },
      size: {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-9 px-3.5 text-sm',
        lg: 'h-11 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
)

Button.displayName = 'Button'
