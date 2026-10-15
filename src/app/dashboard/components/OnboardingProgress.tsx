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
    <div className="bg-gradient-to-r from-[#FFF8F1] via-white to-[#F3F7F2] border border-[#E8E5DE] rounded-2xl p-5 md:p-6 mb-6 relative shadow-xs">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-[#939A92] hover:text-[#20251F] transition-colors p-1"
        title="Dismiss guide"
      >
        <X size={16} />
      </button>

      <div className="flex items-start justify-between gap-4 mb-4 pr-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-[#FFF0E5] text-[#F26A21] flex items-center justify-center">
              <Sparkles size={13} />
            </span>
            <p className="font-bold text-sm text-[#20251F]">
              {completed === 0 ? 'Welcome to Mentorly!' : 'Setup Progress'}
            </p>
          </div>
          <p className="text-xs text-[#6B716B]">
            Complete your student profile to unlock peer sessions and study materials
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-extrabold text-[#F26A21]">{percent}%</p>
          <p className="text-[11px] text-[#6B716B] font-medium">{completed} of {total} completed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-[#F5F3ED] rounded-full mb-4 overflow-hidden border border-[#E8E5DE]/60">
        <div
          className="h-full bg-gradient-to-r from-[#F26A21] to-[#315B3B] rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.done ? '#' : step.href}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              step.done
                ? 'bg-[#E8F0E7]/40 border-[#315B3B]/15 text-[#315B3B] cursor-default'
                : 'bg-white border-[#E8E5DE] hover:border-[#F26A21]/40 hover:shadow-xs group'
            }`}
          >
            {step.done ? (
              <CheckCircle2 size={16} className="text-[#315B3B] flex-shrink-0" />
            ) : (
              <Circle size={16} className="text-[#939A92] group-hover:text-[#F26A21] transition-colors flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${step.done ? 'line-through text-[#6B716B]' : 'text-[#20251F]'}`}>
                {step.label}
              </p>
              {!step.done && (
                <p className="text-[10px] text-[#6B716B] truncate">{step.desc}</p>
              )}
            </div>
            {!step.done && (
              <ChevronRight size={13} className="text-[#939A92] group-hover:text-[#F26A21] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}