'use client'

import Link from 'next/link'
import { CheckCircle, Circle, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'

type Step = {
  id: string
  label: string
  desc: string
  done: boolean
  href: string
}

export default function OnboardingProgress({ steps }: { steps: Step[] }) {
  const [dismissed, setDismissed] = useState(false)
  const completed = steps.filter((s) => s.done).length
  const total = steps.length
  const percent = Math.round((completed / total) * 100)

  if (dismissed || completed === total) return null

  return (
    <div className="bg-gradient-to-br from-[#0d1f35] to-[#0a1628] border border-[#26619C]/20 rounded-2xl p-6 mb-6 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-white/20 hover:text-white/50 transition-colors"
      >
        <X size={15} />
      </button>

      <div className="flex items-start justify-between gap-4 mb-5 pr-6">
        <div>
          <p className="font-semibold text-sm mb-0.5">
            {completed === 0 ? 'Get started with Mentorly' : 'Almost there!'}
          </p>
          <p className="text-xs text-white/40">
            Complete your setup to get {completed === 0 ? '3x' : '2x'} more bookings
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-black text-[#4a8fd4]">{percent}%</p>
          <p className="text-[10px] text-white/30">{completed}/{total} done</p>
        </div>
      </div>

      {/* progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#26619C] to-[#4a8fd4] rounded-full transition-all duration-700"
          style={{ width: percent + '%' }}
        />
      </div>

      {/* steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.done ? '#' : step.href}
            className={
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ' +
              (step.done
                ? 'opacity-50 cursor-default'
                : 'hover:bg-white/5 cursor-pointer')
            }
          >
            {step.done
              ? <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
              : <Circle size={16} className="text-white/20 flex-shrink-0 group-hover:text-[#26619C] transition-colors" />
            }
            <div className="flex-1 min-w-0">
              <p className={'text-xs font-medium ' + (step.done ? 'line-through text-white/30' : 'text-white/70')}>
                {step.label}
              </p>
              {!step.done && (
                <p className="text-[10px] text-white/30 mt-0.5">{step.desc}</p>
              )}
            </div>
            {!step.done && (
              <ChevronRight size={13} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}