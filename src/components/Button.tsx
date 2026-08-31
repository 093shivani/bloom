import type { ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

type Variant = 'primary' | 'secondary' | 'ghost'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-600',
  secondary: 'bg-cream-100 text-ink hover:bg-cream-200',
  ghost: 'bg-transparent text-ink-light hover:bg-cream-100',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={twMerge(
        'rounded-full px-5 py-3 text-sm font-medium transition-colors disabled:opacity-50',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
