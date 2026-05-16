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
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/trades" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Post a skill swap</h1>
          <p className="text-white/40 text-sm mt-1">Find a student to trade tutoring with — free of charge</p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-5">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* subject swap */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">
            Subject exchange *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-red-400/70 mb-2">I need help with</p>
              <select
                value={needSubject}
                onChange={(e) => setNeedSubject(e.target.value)}
                className="w-full bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500/40 transition-colors"
              >
                <option value="" disabled className="bg-[#080C14]">Select subject</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s} className="bg-[#080C14]">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-green-400/70 mb-2">I can teach</p>
              <select
                value={offerSubject}
                onChange={(e) => setOfferSubject(e.target.value)}
                className="w-full bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/40 transition-colors"
              >
                <option value="" disabled className="bg-[#080C14]">Select subject</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s} className="bg-[#080C14]">{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* preview */}
          {needSubject && offerSubject && (
            <div className="flex items-center gap-3 mt-3 p-3 bg-white/3 border border-white/8 rounded-xl">
              <span className="text-sm font-medium text-red-400">{needSubject}</span>
              <ArrowLeftRight size={14} className="text-white/20 flex-shrink-0" />
              <span className="text-sm font-medium text-green-400">{offerSubject}</span>
            </div>
          )}
        </div>

        {/* description */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
            Tell others about yourself — optional
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your level in both subjects, what you're looking for, and any other details..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
          />
        </div>

        {/* mode */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Session mode</label>
          <div className="grid grid-cols-3 gap-3">
            {(['online', 'in-person', 'both'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={
                  'py-2.5 rounded-xl border text-sm font-medium transition-all capitalize ' +
                  (mode === m
                    ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                    : 'border-white/10 text-white/40 hover:border-white/20')
                }
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* schedule section */}
        <div className="border-t border-white/8 pt-5">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-4">Preferred schedule</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setSessionType('single')}
              className={
                'py-3 rounded-xl border text-sm font-medium transition-all ' +
                (sessionType === 'single'
                  ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                  : 'border-white/10 text-white/40 hover:border-white/20')
              }
            >
              Single day
            </button>
            <button
              onClick={() => setSessionType('multi')}
              className={
                'py-3 rounded-xl border text-sm font-medium transition-all ' +
                (sessionType === 'multi'
                  ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                  : 'border-white/10 text-white/40 hover:border-white/20')
              }
            >
              Multiple days
            </button>
          </div>

          {sessionType === 'single' ? (
            <div className="mb-5">
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar size={12} /> Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setEndDate(e.target.value) }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500/40 transition-colors"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar size={12} /> Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar size={12} /> End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500/40 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="mb-5">
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock size={12} /> Start time (daily)
            </label>
            <input
              type="time"
              value={dailyStartTime}
              onChange={(e) => setDailyStartTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500/40 transition-colors"
            />
            {dailyStartTime && hoursPerDay && (
              <p className="text-xs text-teal-400 mt-2">
                Each session: {formatEndTime(dailyStartTime, hoursPerDay)}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Hours per day</label>
            <div className="grid grid-cols-4 gap-2">
              {['1', '1.5', '2', '3'].map((h) => (
                <button
                  key={h}
                  onClick={() => setHoursPerDay(h)}
                  className={
                    'py-2.5 rounded-xl border text-sm font-medium transition-all ' +
                    (hoursPerDay === h
                      ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                      : 'border-white/10 text-white/40 hover:border-white/20')
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
          <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-4 space-y-2">
            <p className="text-xs text-teal-400/60 uppercase tracking-wider">Swap summary</p>
            <p className="text-sm">
              <span className="text-red-400 font-medium">{needSubject}</span>
              <span className="text-white/30 mx-2">↔</span>
              <span className="text-green-400 font-medium">{offerSubject}</span>
            </p>
            <p className="text-xs text-white/40">
              {sessionType === 'single'
                ? new Date(startDate + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                : days + ' days'}
              {' · '}{formatEndTime(dailyStartTime, hoursPerDay)}
              {' · '}{hoursPerDay}hr/day
            </p>
            <p className="text-xs text-teal-400 font-medium">Free — no payment involved</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium"
        >
          {loading ? 'Posting...' : 'Post skill swap'}
        </button>
      </div>
    </div>
  )
}