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
      <div className="h-16 flex items-center justify-center">
        <p className="text-xs text-white/20">No activity yet — book your first session!</p>
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => {
        const height = Math.max((d.count / max) * 100, 4)
        return (
          <div
            key={d.date}
            className="flex-1 group relative"
            title={d.date + ': ' + d.count + ' sessions'}
          >
            <div
              className={
                'w-full rounded-sm transition-all duration-700 ' +
                (d.count > 0 ? 'bg-[#26619C] group-hover:bg-[#4a8fd4]' : 'bg-white/5 group-hover:bg-white/10')
              }
              style={{
                height: animated ? height + '%' : '4%',
                transitionDelay: i * 20 + 'ms',
              }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
              <div className="bg-[#0d1117] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/70 whitespace-nowrap">
                {d.count} session{d.count !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}