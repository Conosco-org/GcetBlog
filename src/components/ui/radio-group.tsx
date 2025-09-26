'use client'

import * as React from 'react'
import { cn } from '../../utilities/ui'

interface RadioGroupContextValue {
  value?: string
  onValueChange?: (value: string) => void
  name: string
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  name: '',
})

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    const name = React.useId()

    return (
      <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
        <div className={cn('grid gap-2', className)} ref={ref} role="radiogroup" {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  },
)
RadioGroup.displayName = 'RadioGroup'

interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)

    return (
      <input
        type="radio"
        ref={ref}
        name={context.name}
        value={value}
        checked={context.value === value}
        onChange={() => context.onValueChange?.(value)}
        className={cn(
          'h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2',
          className,
        )}
        {...props}
      />
    )
  },
)
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
