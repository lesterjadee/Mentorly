'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Clock, AlertCircle, Sparkles } from 'lucide-react'

const CATEGORIES = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Filipino', 'History', 'Programming', 'Web Development',
  'Data Science', 'Design', 'Accounting', 'Economics', 'Other'
]

export default function NewRequestPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
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

  function formatDisplayDate(dateStr: string) {
    if (!dateStr) return ''
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const days = countDays()

  async function handleSubmit() {
    if (!title || !category) {
      setError('Please fill in all required fields.')
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
    if (sessionType === 'multi' && new Date(endDate) < new Date(startDate)) {
      setError('End date must be on or after the start date.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const finalEndDate = sessionType === 'single' ? startDate : endDate
    const totalDays = sessionType === 'single' ? 1 : countDays()

    const { error: insertError } = await supabase.from('requests').insert({
      learner_id: user.id,
      title,
      description,
      category,
      budget: null,
      mode,
      status: 'open',
      session_type: sessionType,
      start_date: startDate,
      end_date: finalEndDate,
      daily_start_time: dailyStartTime,
      hours_per_day: parseFloat(hoursPerDay),
      total_days: totalDays,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/dashboard/requests')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/requests"
          className="w-10 h-10 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] hover:border-[#F26A21]/30 transition-all shadow-xs"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E7] text-[#315B3B] text-xs font-semibold mb-1">
            <Sparkles size={11} />
            Student Request Form
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">Post a Request</h1>
          <p className="text-[#6B716B] text-sm mt-0.5">Tell peer tutors what subject or concept you need help with</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">
            What do you need help with? <span className="text-[#F26A21]">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Need assistance preparing for Differential Equations midterm"
            className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-3 text-[#20251F] text-sm placeholder-[#6B716B]/50 focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">
            Details & Specific Questions
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what topics you're struggling with, textbook chapters, upcoming deadlines, or what format works best for you..."
            rows={3}
            className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-3 text-[#20251F] text-sm placeholder-[#6B716B]/50 focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">
            Category <span className="text-[#F26A21]">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-3 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
          >
            <option value="" disabled>Select subject category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Preferred mode */}
        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">
            Preferred Mode <span className="text-[#F26A21]">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['online', 'in-person', 'both'] as const).map((m) => {
              const isSelected = mode === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={
                    'py-2.5 rounded-xl border text-sm font-semibold transition-all capitalize ' +
                    (isSelected
                      ? 'border-[#F26A21] bg-[#FFF0E5] text-[#F26A21] shadow-xs'
                      : 'border-[#E8E5DE] bg-white text-[#6B716B] hover:text-[#20251F] hover:border-[#E8E5DE]')
                  }
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="border-t border-[#E8E5DE] pt-5">
          <p className="text-xs font-bold text-[#315B3B] uppercase tracking-wider mb-3">Preferred Schedule</p>

          {/* Session type */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => setSessionType('single')}
              className={
                'py-2.5 rounded-xl border text-sm font-semibold transition-all ' +
                (sessionType === 'single'
                  ? 'border-[#F26A21] bg-[#FFF0E5] text-[#F26A21] shadow-xs'
                  : 'border-[#E8E5DE] bg-white text-[#6B716B] hover:text-[#20251F]')
              }
            >
              Single Session
            </button>
            <button
              type="button"
              onClick={() => setSessionType('multi')}
              className={
                'py-2.5 rounded-xl border text-sm font-semibold transition-all ' +
                (sessionType === 'multi'
                  ? 'border-[#F26A21] bg-[#FFF0E5] text-[#F26A21] shadow-xs'
                  : 'border-[#E8E5DE] bg-white text-[#6B716B] hover:text-[#20251F]')
              }
            >
              Multi-Day Series
            </button>
          </div>

          {/* Dates */}
          {sessionType === 'single' ? (
            <div className="mb-5">
              <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#315B3B]" /> Preferred Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setEndDate(e.target.value) }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#315B3B]" /> Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#315B3B]" /> End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
                />
              </div>
            </div>
          )}

          {/* Time */}
          <div className="mb-5">
            <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock size={13} className="text-[#F26A21]" /> Preferred Daily Start Time
            </label>
            <input
              type="time"
              value={dailyStartTime}
              onChange={(e) => setDailyStartTime(e.target.value)}
              className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
            />
            {dailyStartTime && hoursPerDay && (
              <p className="text-xs text-[#315B3B] font-medium mt-1.5">
                Session window: {formatEndTime(dailyStartTime, hoursPerDay)}
              </p>
            )}
          </div>

          {/* Hours per day */}
          <div>
            <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">
              Hours Per Session
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['1', '1.5', '2', '3'].map((h) => {
                const isSelected = hoursPerDay === h
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHoursPerDay(h)}
                    className={
                      'py-2 rounded-xl border text-sm font-semibold transition-all ' +
                      (isSelected
                        ? 'border-[#F26A21] bg-[#FFF0E5] text-[#F26A21] shadow-xs'
                        : 'border-[#E8E5DE] bg-white text-[#6B716B] hover:text-[#20251F]')
                    }
                  >
                    {h} hr
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Schedule summary */}
        {startDate && dailyStartTime && (
          <div className="bg-[#E8F0E7]/60 border border-[#315B3B]/20 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-[#315B3B] uppercase tracking-wider">Schedule Summary</p>
            <div className="flex justify-between text-xs text-[#20251F]">
              <span className="text-[#6B716B]">
                {sessionType === 'single' ? 'Date' : 'Date range'}
              </span>
              <span className="font-semibold">
                {sessionType === 'single'
                  ? formatDisplayDate(startDate)
                  : formatDisplayDate(startDate) + ' → ' + formatDisplayDate(endDate)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#20251F]">
              <span className="text-[#6B716B]">Time each day</span>
              <span className="font-semibold">{formatEndTime(dailyStartTime, hoursPerDay)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#20251F]">
              <span className="text-[#6B716B]">Duration</span>
              <span className="font-semibold">{hoursPerDay} hr / day</span>
            </div>
            {sessionType === 'multi' && startDate && endDate && (
              <div className="flex justify-between text-xs text-[#20251F]">
                <span className="text-[#6B716B]">Total days</span>
                <span className="font-semibold">{days} day{days !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#F26A21] hover:bg-[#D95416] disabled:opacity-50 transition-colors py-3.5 rounded-xl text-white text-sm font-semibold shadow-xs"
        >
          {loading ? 'Posting Request...' : 'Publish Peer Request'}
        </button>
      </div>
    </div>
  )
}
