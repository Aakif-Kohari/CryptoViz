import type { ComponentPropsWithoutRef, ElementType } from 'react'

interface HeadingProps extends ComponentPropsWithoutRef<'h1'> {
  as?: ElementType
}

export function Heading({ as: Component = 'h1', className = '', ...props }: HeadingProps) {
  return <Component className={`text-zinc-900 dark:text-zinc-100 ${className}`.trim()} {...props} />
}

interface TextProps extends ComponentPropsWithoutRef<'p'> {
  size?: 'sm' | 'base' | 'lg'
  secondary?: boolean
}

export function Text({ size = 'base', secondary = false, className = '', ...props }: TextProps) {
  const sizeClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }[size]

  return (
    <p
      className={`${sizeClass} ${secondary ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'} ${className}`.trim()}
      {...props}
    />
  )
}
