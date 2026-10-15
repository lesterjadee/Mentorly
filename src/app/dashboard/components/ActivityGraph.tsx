'use client'

import { useEffect, useState } from 'react'

type Props = {
  data: { date: string; count: number }[]
}

export default function ActivityGraph({ data }: Props) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  if (!data || data.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center bg-[#F5F3ED]/40 rounded-xl border border-dashed border-[#E8E5DE]">
        <p className="text-xs text-[#6B716B] font-medium">No activity yet — book or post your first session!</p>
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="flex items-end gap-1.5 md:gap-2 h-24 pt-4">
      {data.map((d, i) => {
        const height = Math.max((d.count / max) * 100, 6)
        const hasActivity = d.count > 0
        return (
          <div
            key={d.date}
            className="flex-1 flex flex-col items-center h-full justify-end group relative"
          >
            <div
              className={`w-full rounded-t-md transition-all duration-500 cursor-pointer ${
                hasActivity
                  ? 'bg-[#F26A21] group-hover:bg-[#D95416] shadow-xs'
                  : 'bg-[#F5F3ED] group-hover:bg-[#E8E5DE]'
              }`}
              style={{
                height: animated ? `${height}%` : '6%',
                transitionDelay: `${i * 25}ms`,
              }}
            />
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
              <div className="bg-[#20251F] text-white rounded-lg px-2.5 py-1 text-[11px] font-medium whitespace-nowrap shadow-lg">
                <span className="font-bold text-[#F26A21]">{d.count}</span> session{d.count !== 1 ? 's' : ''} on {d.date}
              </div>
              <div className="w-1.5 h-1.5 bg-[#20251F] rotate-45 -mt-0.5" />
            </div>
            {/* Date label on mobile/desktop */}
            <span className="text-[9px] text-[#939A92] mt-1.5 hidden md:block">
              {d.date.slice(8)}
            </span>
          </div>
        )
      })}
    </div>
  )
}