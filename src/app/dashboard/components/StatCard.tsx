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
    const duration = 1100
    const end = value as number

    const timer = setTimeout(() => {
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        setDisplayed(Math.floor(eased * end))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay, isNumber])

  const isGreen = color.includes('green') || color.includes('315')
  const iconContainerClass = isGreen
    ? 'bg-[#E8F0E7] text-[#315B3B] border border-[#315B3B]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]'
    : 'bg-[#FFF0E5] text-[#F26A21] border border-[#F26A21]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]'

  return (
    <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 md:p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:border-[#D9D4C7] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[11px] font-bold text-[#6B716B] uppercase tracking-widest leading-none">{label}</p>
        <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${iconContainerClass}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl md:text-3xl font-black text-[#20251F] tracking-tight mb-1 tabular-nums">
          {isNumber ? displayed : value}
        </p>
        <p className="text-xs text-[#6B716B] font-medium leading-tight">{sub}</p>
      </div>
    </div>
  )
}
