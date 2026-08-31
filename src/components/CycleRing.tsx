import type { ReactNode } from 'react'

export interface CycleRingProps {
  /** 0-100, how far through the cycle today is. */
  progressPercent: number
  children: ReactNode
  size?: number
}

/** A single-tone progress ring around a soft, flat circle — no rainbow segments. */
export function CycleRing({ progressPercent, children, size = 260 }: CycleRingProps) {
  const angle = Math.max(0, Math.min(100, progressPercent)) * 3.6
  const ringWidth = size * 0.045

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(var(--color-rose-500) ${angle}deg, var(--color-cream-200) ${angle}deg 360deg)`,
        }}
      />
      <div
        className="absolute rounded-full bg-cream-100 flex items-center justify-center"
        style={{ inset: ringWidth }}
      >
        {children}
      </div>
    </div>
  )
}
