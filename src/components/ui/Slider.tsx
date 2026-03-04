import { type InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '../../lib/cn'

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string
  showValue?: boolean
  onChange?: (value: number) => void
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue = true, onChange, value, id: idProp, ...props }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between gap-2">
            {label && (
              <label htmlFor={id} className="text-xs text-(--color-muted) select-none">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-xs text-(--color-muted) tabular-nums">
                {value}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type="range"
          value={value}
          onChange={(e) => onChange?.(e.target.valueAsNumber)}
          className={cn(
            'w-full h-2 appearance-none cursor-pointer',
            'bg-(--color-border)',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:bg-(--color-accent)',
            '[&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:duration-75',
            '[&::-webkit-slider-thumb]:hover:bg-(--color-accent-hover)',
            '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:border-none',
            '[&::-moz-range-thumb]:bg-(--color-accent)',
            '[&::-moz-range-thumb]:hover:bg-(--color-accent-hover)',
            'focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
          {...props}
        />
      </div>
    )
  }
)

Slider.displayName = 'Slider'
