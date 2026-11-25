'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, ChevronRight, X, Sparkles } from 'lucide-react'
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
    <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 md:p-5 relative shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Subtle top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#F26A21] via-[#FAC898] to-[#315B3B] opacity-70" />

      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg bg-[#F5F3ED] hover:bg-[#E8E5DE] flex items-center justify-center text-[#939A92] hover:text-[#20251F] transition-all duration-150"
        title="Dismiss guide"
      >
        <X size={14} />
      </button>

      <div className="flex items-start justify-between gap-4 mb-3 pr-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-[#FFF0E5] text-[#F26A21] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <Sparkles size={12} />
            </span>
            <p className="font-bold text-sm text-[#20251F] tracking-tight">
              {completed === 0 ? 'Welcome to Mentorly!' : 'Setup Progress'}
            </p>
          </div>
          <p className="text-xs text-[#6B716B] leading-relaxed">
            Complete your student profile to unlock peer sessions and study materials
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-black text-[#F26A21] tracking-tight tabular-nums leading-none">{percent}%</p>
          <p className="text-[11px] text-[#939A92] font-medium mt-0.5">{completed} of {total} done</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-[#F5F3ED] rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#F26A21] to-[#315B3B] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.done ? '#' : step.href}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 ${
              step.done
                ? 'bg-[#E8F0E7]/50 border-[#315B3B]/12 text-[#315B3B] cursor-default'
                : 'bg-[#FFFCF7] border-[#E8E5DE] hover:border-[#F26A21]/35 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 group'
            }`}
          >
            {step.done ? (
              <CheckCircle2 size={15} className="text-[#315B3B] flex-shrink-0" />
            ) : (
              <Circle size={15} className="text-[#D9D4C7] group-hover:text-[#F26A21] transition-colors flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate leading-tight ${step.done ? 'line-through text-[#939A92]' : 'text-[#20251F]'}`}>
                {step.label}
              </p>
              {!step.done && (
                <p className="text-[10px] text-[#939A92] truncate mt-0.5">{step.desc}</p>
              )}
            </div>
            {!step.done && (
              <ChevronRight size={12} className="text-[#D9D4C7] group-hover:text-[#F26A21] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
