import { type InputHTMLAttributes, forwardRef, useEffect, useRef } from 'react'
import { PixelIcon } from '../icons/PixelIcon'
import { cn } from '../../lib/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  indeterminate?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, indeterminate, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      const el = inputRef.current
      if (el) el.indeterminate = !!indeterminate
    }, [indeterminate])

    const setRefs = (el: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
    }

    return (
      <label className={cn('inline-flex items-center justify-center cursor-pointer', className)}>
        <input
          ref={setRefs}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="sr-only peer"
          aria-checked={indeterminate ? 'mixed' : checked}
          {...props}
        />
        <span
          className={cn(
            'w-4 h-4 flex items-center justify-center shrink-0 border border-(--color-border)',
            'transition-[background-color,border-color] duration-75',
            'peer-focus-visible:outline-2 peer-focus-visible:outline-(--color-accent) peer-focus-visible:outline-offset-2',
            'peer-disabled:opacity-40 peer-disabled:cursor-not-allowed',
            (checked && !indeterminate) && 'bg-(--color-accent) border-(--color-accent)',
            indeterminate && 'bg-(--color-accent) border-(--color-accent)',
            !checked && !indeterminate && 'bg-transparent'
          )}
        >
          {checked && !indeterminate && (
            <PixelIcon icon="check" width={12} height={12} className="text-white" />
          )}
          {indeterminate && (
            <span className="w-2 h-0.5 bg-white" />
          )}
        </span>
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
