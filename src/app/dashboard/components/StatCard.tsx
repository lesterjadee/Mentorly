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
    const duration = 1000
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

  // BudgetMate style: distinct colored icon container based on variant
  const isGreen = color.includes('green') || color.includes('315')
  const iconContainerClass = isGreen
    ? 'bg-[#E8F0E7] text-[#315B3B] border border-[#315B3B]/20'
    : 'bg-[#FFF0E5] text-[#F26A21] border border-[#F26A21]/20'

  return (
    <div className="bg-white border border-[#E8E5DE] rounded-2xl p-5 md:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#E8E5DE] transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[#6B716B] uppercase tracking-wider">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105 ${iconContainerClass}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl md:text-4xl font-extrabold text-[#20251F] tracking-tight mb-1">
          {isNumber ? displayed : value}
        </p>
        <p className="text-xs text-[#6B716B] font-medium">{sub}</p>
      </div>
    </div>
  )
}