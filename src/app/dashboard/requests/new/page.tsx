'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'

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
  const [budget, setBudget] = useState('')
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
      budget: budget ? parseFloat(budget) : null,
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
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/requests" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Post a request</h1>
          <p className="text-white/40 text-sm mt-1">Tell tutors what you need help with</p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-5">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* subject */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
            What do you need help with? *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Need help with Differential Equations"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
          />
        </div>

        {/* description */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Details</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what topics you're struggling with, your current level, and what kind of help you need..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
          />
        </div>

        {/* category + budget */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
            >
              <option value="" disabled className="bg-[#080C14]">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#080C14]">{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Budget (₱/hr) — optional</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 150"
              min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
            />
          </div>
        </div>

        {/* mode */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Preferred mode *</label>
          <div className="grid grid-cols-3 gap-3">
            {(['online', 'in-person', 'both'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={
                  'py-2.5 rounded-xl border text-sm font-medium transition-all capitalize ' +
                  (mode === m
                    ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
                    : 'border-white/10 text-white/40 hover:border-white/20')
                }
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* divider */}
        <div className="border-t border-white/8 pt-2">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-4">Preferred schedule</p>

          {/* session type */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setSessionType('single')}
              className={
                'py-3 rounded-xl border text-sm font-medium transition-all ' +
                (sessionType === 'single'
                  ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
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
                  ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
                  : 'border-white/10 text-white/40 hover:border-white/20')
              }
            >
              Multiple days
            </button>
          </div>

          {/* dates */}
          {sessionType === 'single' ? (
            <div className="mb-5">
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar size={12} /> Preferred date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setEndDate(e.target.value) }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
                />
              </div>
            </div>
          )}

          {/* time */}
          <div className="mb-5">
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock size={12} /> Preferred start time (daily)
            </label>
            <input
              type="time"
              value={dailyStartTime}
              onChange={(e) => setDailyStartTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
            />
            {dailyStartTime && hoursPerDay && (
              <p className="text-xs text-[#4a8fd4] mt-2">
                Each session: {formatEndTime(dailyStartTime, hoursPerDay)}
              </p>
            )}
          </div>

          {/* hours per day */}
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
                      ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
                      : 'border-white/10 text-white/40 hover:border-white/20')
                  }
                >
                  {h}hr
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* schedule summary */}
        {startDate && dailyStartTime && (
          <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-2">
            <p className="text-xs text-white/30 uppercase tracking-wider">Schedule summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">
                {sessionType === 'single' ? 'Date' : 'Date range'}
              </span>
              <span className="text-white/70">
                {sessionType === 'single'
                  ? formatDisplayDate(startDate)
                  : formatDisplayDate(startDate) + ' → ' + formatDisplayDate(endDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Time each day</span>
              <span className="text-white/70">{formatEndTime(dailyStartTime, hoursPerDay)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Hours per day</span>
              <span className="text-white/70">{hoursPerDay}hr</span>
            </div>
            {sessionType === 'multi' && startDate && endDate && (
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Total days</span>
                <span className="text-white/70">{days} day{days !== 1 ? 's' : ''}</span>
              </div>
            )}
            {budget && (
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Budget</span>
                <span className="text-[#4a8fd4]">₱{budget}/hr</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium"
        >
          {loading ? 'Posting...' : 'Post request'}
        </button>
      </div>
    </div>
  )
}