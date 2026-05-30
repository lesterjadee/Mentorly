'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Clock, Shield } from 'lucide-react'
import Link from 'next/link'

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')

  const [session, setSession] = useState<any>(null)
  const [sessionType, setSessionType] = useState<'single' | 'multi'>('single')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dailyStartTime, setDailyStartTime] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState('1')
  const [mode, setMode] = useState<'online' | 'in-person'>('online')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchSession() {
      if (!serviceId) return
      const supabase = createClient()
      const { data } = await supabase
        .from('services')
        .select('*, users!services_tutor_id_fkey(full_name, school, course, specs_role)')
        .eq('id', serviceId)
        .single()
      if (data) {
        setSession(data)
        // pre-fill schedule from session if available
        if (data.start_date) setStartDate(data.start_date)
        if (data.end_date) setEndDate(data.end_date)
        if (data.daily_start_time) setDailyStartTime(data.daily_start_time.slice(0,5))
        if (data.hours_per_day) setHoursPerDay(String(data.hours_per_day))
        if (data.mode && data.mode !== 'both') setMode(data.mode)
        if (data.total_days && data.total_days > 1) setSessionType('multi')
      }
    }
    fetchSession()
  }, [serviceId])

  function countDays() {
    if (!startDate || !endDate) return 1
    const s = new Date(startDate), e = new Date(endDate)
    if (e < s) return 1
    return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  function formatEndTime(startTime: string, hours: string) {
    if (!startTime || !hours) return ''
    const [h, m] = startTime.split(':').map(Number)
    const totalMins = h * 60 + m + parseFloat(hours) * 60
    const endH = Math.floor(totalMins / 60) % 24
    const endM = totalMins % 60
    const period = (t: number) => t >= 12 ? 'PM' : 'AM'
    const fmt = (t: number) => t % 12 === 0 ? 12 : t % 12
    return fmt(h) + ':' + String(m).padStart(2,'0') + ' ' + period(h) + ' – ' + fmt(endH) + ':' + String(endM).padStart(2,'0') + ' ' + period(endH)
  }

  function formatDisplayDate(dateStr: string) {
    if (!dateStr) return ''
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  async function handleBooking() {
    if (!startDate || !dailyStartTime) {
      setError('Please fill in the date and time fields.')
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
    const scheduledAt = new Date(startDate + 'T' + dailyStartTime)

    const { error: bookingError } = await supabase.from('bookings').insert({
      service_id: serviceId,
      learner_id: user.id,
      tutor_id: session.tutor_id,
      scheduled_at: scheduledAt.toISOString(),
      duration_hours: parseFloat(hoursPerDay) * totalDays,
      mode,
      total_price: 0,
      notes,
      status: 'pending',
      session_type: sessionType,
      start_date: startDate,
      end_date: finalEndDate,
      daily_start_time: dailyStartTime,
      hours_per_day: parseFloat(hoursPerDay),
      total_days: totalDays,
      booking_title: session.title,
    })

    if (bookingError) {
      setError(bookingError.message)
      setLoading(false)
    } else {
      router.push('/dashboard/bookings?success=true')
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#26619C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const days = countDays()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={'/dashboard/sessions/' + serviceId} className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Book a session</h1>
          <p className="text-white/40 text-sm mt-0.5">Confirm your booking details</p>
        </div>
      </div>

      {/* session summary */}
      <div className="bg-gradient-to-br from-[#0d1f35] to-[#0a1628] border border-[#26619C]/20 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#26619C] flex items-center justify-center text-base font-black text-white flex-shrink-0">
            {session.users?.full_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{session.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield size={10} className="text-[#4a8fd4]" />
              <p className="text-xs text-[#4a8fd4]">
                {session.users?.full_name} · SPECS {session.users?.specs_role || 'Member'}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-black text-green-400">FREE</p>
            <p className="text-[10px] text-white/30">No charge</p>
          </div>
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-5">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* session type toggle */}
        <div className="grid grid-cols-2 gap-3">
          {(['single', 'multi'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSessionType(t)}
              className={
                'py-3 rounded-xl border text-sm font-semibold transition-all ' +
                (sessionType === t
                  ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
                  : 'border-white/10 text-white/40 hover:border-white/20')
              }
            >
              {t === 'single' ? 'Single day' : 'Multiple days'}
            </button>
          ))}
        </div>

        {/* dates */}
        {sessionType === 'single' ? (
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar size={12} /> Date
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
          <div className="grid grid-cols-2 gap-4">
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
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Clock size={12} /> Start time
          </label>
          <input
            type="time"
            value={dailyStartTime}
            onChange={(e) => setDailyStartTime(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
          />
          {dailyStartTime && hoursPerDay && (
            <p className="text-xs text-[#4a8fd4] mt-2">
              {formatEndTime(dailyStartTime, hoursPerDay)}
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
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* mode */}
        {session.mode === 'both' && (
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Session mode</label>
            <div className="grid grid-cols-2 gap-3">
              {(['online', 'in-person'] as const).map((m) => (
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
        )}

        {/* notes */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
            Message to tutor — optional
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Topics you need help with, your current level, questions you have..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
          />
        </div>

        {/* session summary */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-5 space-y-3">
          <p className="text-xs text-white/30 uppercase tracking-wider">Booking summary</p>
          {startDate && (
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
          )}
          {dailyStartTime && (
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Time</span>
              <span className="text-white/70">{formatEndTime(dailyStartTime, hoursPerDay)}</span>
            </div>
          )}
          {sessionType === 'multi' && startDate && endDate && (
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Total days</span>
              <span className="text-white/70">{days} day{days !== 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="border-t border-white/8 pt-3 flex items-center justify-between">
            <span className="text-sm text-white/40">Total cost</span>
            <span className="text-xl font-black text-green-400">FREE</span>
          </div>
        </div>

        {/* free notice */}
        <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3">
          <Shield size={14} className="text-green-400 flex-shrink-0" />
          <p className="text-xs text-white/50">
            This session is <span className="text-green-400 font-semibold">completely free</span> — provided by SPECS as a community service.
          </p>
        </div>

        <button
          onClick={handleBooking}
          disabled={loading}
          className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3.5 rounded-xl text-white text-sm font-bold"
        >
          {loading ? 'Sending request...' : 'Confirm booking — Free'}
        </button>
      </div>
    </div>
  )
}