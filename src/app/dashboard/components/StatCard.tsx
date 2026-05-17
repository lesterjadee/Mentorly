'use client'

import { useEffect, useState } from 'react'

type Props = {
  label: string
  value: number | string
  sub: string
  icon: React.ReactNode
  color: string
  delay?: number
}

export default function StatCard({ label, value, sub, icon, color, delay = 0 }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const isNumber = typeof value === 'number'

  useEffect(() => {
    if (!isNumber) return
    const start = Date.now()
    const duration = 1200
    const end = value as number

    const timer = setTimeout(() => {
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayed(Math.floor(eased * end))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay, isNumber])

  return (
    <div className={
      'relative bg-white/3 border border-white/8 rounded-2xl p-6 overflow-hidden group ' +
      'hover:border-white/15 transition-all duration-300 hover:-translate-y-0.5'
    }>
      {/* glow on hover */}
      <div className={'absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ' + color} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-white/30 uppercase tracking-widest font-medium">{label}</p>
          <div className="text-white/20 group-hover:text-white/40 transition-colors">
            {icon}
          </div>
        </div>
        <p className="text-4xl font-black tracking-tight mb-1 text-white">
          {isNumber ? displayed : value}
        </p>
        <p className="text-xs text-white/30">{sub}</p>
      </div>
    </div>
  )
}