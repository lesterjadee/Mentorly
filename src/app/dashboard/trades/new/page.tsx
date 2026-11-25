'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowLeftRight, Calendar, Clock } from 'lucide-react'

const SUBJECTS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Filipino', 'History', 'Programming', 'Web Development',
  'Data Science', 'Design', 'Accounting', 'Economics', 'Other'
]

export default function NewTradePage() {
  const router = useRouter()

  const [needSubject, setNeedSubject] = useState('')
  const [offerSubject, setOfferSubject] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<'online' | 'in-person' | 'both'>('both')
  const [sessionType, setSessionType] = useState<'single' | 'multi'>('single')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dailyStartTime, setDailyStartTime] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function countDays() {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end < start) return 0
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  function formatEndTime(startTime: string, hours: string) {
    if (!startTime || !hours) return ''
    const [h, m] = startTime.split(':').map(Number)
    const totalMins = h * 60 + m + parseFloat(hours) * 60
    const endH = Math.floor(totalMins / 60) % 24
    const endM = totalMins % 60
    const period = (t: number) => t >= 12 ? 'PM' : 'AM'
    const fmt = (t: number) => t % 12 === 0 ? 12 : t % 12
    return fmt(h) + ':' + String(m).padStart(2, '0') + ' ' + period(h) + ' – ' + fmt(endH) + ':' + String(endM).padStart(2, '0') + ' ' + period(endH)
  }

  async function handleSubmit() {
    if (!needSubject || !offerSubject) {
      setError('Please select both subjects.')
      return
    }
    if (needSubject === offerSubject) {
      setError('The subject you need and the subject you offer must be different.')
      return
    }
    if (!startDate || !dailyStartTime) {
      setError('Please select a date and time.')
      return
    }
    if (sessionType === 'multi' && !endDate) {
      setError('Please select an end date.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const finalEndDate = sessionType === 'single' ? startDate : endDate
    const totalDays = sessionType === 'single' ? 1 : countDays()

    const { error: insertError } = await supabase.from('trades').insert({
      poster_id: user.id,
      need_subject: needSubject,
      offer_subject: offerSubject,
      description,
      mode,
      session_type: sessionType,
      start_date: startDate,
      end_date: finalEndDate,
      daily_start_time: dailyStartTime,
      hours_per_day: parseFloat(hoursPerDay),
      total_days: totalDays,
      status: 'open',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/dashboard/trades')
    }
  }

  const days = countDays()

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/trades"
          className="w-9 h-9 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] transition-all shadow-xs"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#20251F] tracking-tight leading-tight">Post a skill swap</h1>
          <p className="text-[#6B716B] text-xs mt-0.5">Find a student to trade tutoring with — free of charge</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <div className="lg:col-span-7 bg-white border border-[#E8E5DE] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">

        {/* subject swap */}
        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-3 block">
            Subject exchange *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-[#F26A21] mb-1.5">I need help with</p>
              <select
                value={needSubject}
                onChange={(e) => setNeedSubject(e.target.value)}
                className="w-full bg-[#FFF0E5]/50 border border-[#F26A21]/25 rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] transition-colors"
              >
                <option value="" disabled>Select subject</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#315B3B] mb-1.5">I can teach</p>
              <select
                value={offerSubject}
                onChange={(e) => setOfferSubject(e.target.value)}
                className="w-full bg-[#E8F0E7]/50 border border-[#315B3B]/25 rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#315B3B] transition-colors"
              >
                <option value="" disabled>Select subject</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* preview */}
          {needSubject && offerSubject && (
            <div className="flex items-center gap-3 mt-3 p-3 bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl">
              <span className="text-sm font-semibold text-[#F26A21]">{needSubject}</span>
              <ArrowLeftRight size={14} className="text-[#6B716B] flex-shrink-0" />
              <span className="text-sm font-semibold text-[#315B3B]">{offerSubject}</span>
            </div>
          )}
        </div>

        {/* description */}
        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-1.5 block">
            Tell others about yourself — optional
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your level in both subjects, what you're looking for, and any other details..."
            rows={4}
            className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-3 text-[#20251F] text-sm placeholder-[#6B716B]/50 focus:outline-none focus:border-[#F26A21] transition-colors resize-none"
          />
        </div>

        {/* mode */}
        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">Session mode</label>
          <div className="grid grid-cols-3 gap-3">
            {(['online', 'in-person', 'both'] as const).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className={
                  'py-2.5 rounded-xl border text-sm font-semibold transition-all capitalize ' +
                  (mode === m
                    ? 'border-[#315B3B] bg-[#E8F0E7] text-[#315B3B]'
                    : 'border-[#E8E5DE] bg-white text-[#6B716B] hover:text-[#20251F]')
                }
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Schedule & Submit */}
      <div className="lg:col-span-5 bg-white border border-[#E8E5DE] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        {/* schedule section */}
        <div>
          <p className="text-xs font-bold text-[#315B3B] uppercase tracking-wider mb-3">Preferred schedule</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setSessionType('single')}
              className={
                'py-2.5 rounded-xl border text-sm font-semibold transition-all ' +
                (sessionType === 'single'
                  ? 'border-[#315B3B] bg-[#E8F0E7] text-[#315B3B]'
                  : 'border-[#E8E5DE] bg-white text-[#6B716B] hover:text-[#20251F]')
              }
            >
              Single day
            </button>
            <button
              type="button"
              onClick={() => setSessionType('multi')}
              className={
                'py-2.5 rounded-xl border text-sm font-semibold transition-all ' +
                (sessionType === 'multi'
                  ? 'border-[#315B3B] bg-[#E8F0E7] text-[#315B3B]'
                  : 'border-[#E8E5DE] bg-white text-[#6B716B] hover:text-[#20251F]')
              }
            >
              Multiple days
            </button>
          </div>

          {sessionType === 'single' ? (
            <div className="mb-4">
              <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <Calendar size={12} className="text-[#315B3B]" /> Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setEndDate(e.target.value) }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#315B3B] transition-colors"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Calendar size={12} className="text-[#315B3B]" /> Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#315B3B] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Calendar size={12} className="text-[#315B3B]" /> End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#315B3B] transition-colors"
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Clock size={12} className="text-[#F26A21]" /> Start time (daily)
            </label>
            <input
              type="time"
              value={dailyStartTime}
              onChange={(e) => setDailyStartTime(e.target.value)}
              className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#315B3B] transition-colors"
            />
            {dailyStartTime && hoursPerDay && (
              <p className="text-xs text-[#315B3B] font-medium mt-1.5">
                Each session: {formatEndTime(dailyStartTime, hoursPerDay)}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">Hours per day</label>
            <div className="grid grid-cols-4 gap-2">
              {['1', '1.5', '2', '3'].map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setHoursPerDay(h)}
                  className={
                    'py-2 rounded-xl border text-sm font-semibold transition-all ' +
                    (hoursPerDay === h
                      ? 'border-[#315B3B] bg-[#E8F0E7] text-[#315B3B]'
                      : 'border-[#E8E5DE] bg-white text-[#6B716B] hover:text-[#20251F]')
                  }
                >
                  {h}hr
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* summary */}
        {needSubject && offerSubject && startDate && dailyStartTime && (
          <div className="bg-[#E8F0E7]/60 border border-[#315B3B]/20 rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-bold text-[#315B3B] uppercase tracking-wider">Swap summary</p>
            <p className="text-sm">
              <span className="text-[#F26A21] font-semibold">{needSubject}</span>
              <span className="text-[#6B716B] mx-2">↔</span>
              <span className="text-[#315B3B] font-semibold">{offerSubject}</span>
            </p>
            <p className="text-xs text-[#6B716B]">
              {sessionType === 'single'
                ? new Date(startDate + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                : days + ' days'}
              {' · '}{formatEndTime(dailyStartTime, hoursPerDay)}
              {' · '}{hoursPerDay}hr/day
            </p>
            <p className="text-xs text-[#315B3B] font-semibold">Free — no payment involved</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#315B3B] hover:bg-[#24452D] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-semibold shadow-xs"
        >
          {loading ? 'Posting...' : 'Post skill swap'}
        </button>
      </div>
      </div>
    </div>
  )
}