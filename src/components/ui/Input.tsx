import { type InputHTMLAttributes, forwardRef, useId } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const inputVariants = cva(
  [
    'w-full font-[inherit] leading-none text-(--color-text) placeholder:text-(--color-muted)',
    'transition-[border-color,background-color,box-shadow] duration-75',
    'focus:outline-none focus:shadow-[0_0_0_2px_var(--color-bg),0_0_0_4px_var(--color-accent)]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-(--color-surface) border border-(--color-border)',
          'hover:border-[color-mix(in_srgb,var(--color-border)_50%,var(--color-accent))]',
        ],
        ghost: [
          'bg-transparent border border-transparent',
          'hover:border-(--color-border)',
        ],
      },
      size: {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-9 px-3 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, id: idProp, ...props }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-(--color-muted) select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            inputVariants({ variant, size }),
            error && 'border-(--color-danger) focus:shadow-[0_0_0_2px_var(--color-bg),0_0_0_4px_var(--color-danger)]',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${id}-error`} className="text-xs text-(--color-danger)">
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
