import { type LabelHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-xs font-medium text-(--color-muted) select-none', className)}
      {...props}
    >
      {children}
      {required && <span className="text-(--color-danger) ml-0.5">*</span>}
    </label>
  )
)

Label.displayName = 'Label'
