'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Clock, Shield, CheckCircle2 } from 'lucide-react'
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
        <div className="w-6 h-6 border-2 border-[#F26A21] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const days = countDays()

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href={'/dashboard/sessions/' + serviceId}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B716B] hover:text-[#20251F] transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          <span>Back to session details</span>
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#20251F]">Book Tutoring Session</h1>
        <p className="text-xs text-[#6B716B] mt-0.5">Confirm your schedule preferences with your SPECS mentor</p>
      </div>

      {/* Session Summary Card */}
      <div className="bg-gradient-to-br from-[#FFF8F1] via-white to-[#F3F7F2] border border-[#E8E5DE] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-base font-extrabold text-[#D95416] flex-shrink-0 shadow-2xs">
            {session.users?.full_name?.[0] || 'T'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base text-[#20251F] truncate">{session.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield size={12} className="text-[#315B3B]" />
              <p className="text-xs font-semibold text-[#315B3B] truncate">
                {session.users?.full_name} · SPECS {session.users?.specs_role || 'Mentor'}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-xs font-extrabold text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 px-3 py-1 rounded-full">
              FREE
            </span>
            <p className="text-[10px] text-[#6B716B] font-medium mt-1">Peer Tutoring</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Schedule Type Selection */}
        <div>
          <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2.5 block">
            Booking Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['single', 'multi'] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setSessionType(t)}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  sessionType === t
                    ? 'border-[#F26A21] bg-[#FFF0E5] text-[#D95416] shadow-2xs'
                    : 'border-[#E8E5DE] text-[#6B716B] hover:border-[#F26A21]/30 hover:text-[#20251F]'
                }`}
              >
                {t === 'single' ? 'Single Session' : 'Multiple Days Series'}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        {sessionType === 'single' ? (
          <div>
            <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar size={13} className="text-[#315B3B]" /> Session Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setEndDate(e.target.value) }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 outline-none transition-all"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#315B3B]" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#315B3B]" /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Time & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock size={13} className="text-[#F26A21]" /> Preferred Start Time
            </label>
            <input
              type="time"
              value={dailyStartTime}
              onChange={(e) => setDailyStartTime(e.target.value)}
              className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 outline-none transition-all"
            />
            {dailyStartTime && hoursPerDay && (
              <p className="text-xs font-semibold text-[#D95416] mt-1.5">
                {formatEndTime(dailyStartTime, hoursPerDay)}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 block">
              Hours per Day
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['1', '1.5', '2', '3'].map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setHoursPerDay(h)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    hoursPerDay === h
                      ? 'border-[#315B3B] bg-[#E8F0E7] text-[#315B3B]'
                      : 'border-[#E8E5DE] text-[#6B716B] hover:border-[#315B3B]/30'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode (if both allowed) */}
        {session.mode === 'both' && (
          <div>
            <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2.5 block">
              Meeting Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['online', 'in-person'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all capitalize ${
                    mode === m
                      ? 'border-[#F26A21] bg-[#FFF0E5] text-[#D95416]'
                      : 'border-[#E8E5DE] text-[#6B716B] hover:border-[#F26A21]/30'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 block">
            Message for Tutor (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Specify topics you want to prioritize or questions you have prepared..."
            rows={3}
            className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm placeholder:text-[#939A92] focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all outline-none resize-none"
          />
        </div>

        {/* Summary Card */}
        <div className="bg-[#FFFCF7] border border-[#E8E5DE] rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-[#939A92] uppercase tracking-wider">
            Booking Summary
          </p>
          {startDate && (
            <div className="flex justify-between text-xs pt-1">
              <span className="text-[#6B716B]">{sessionType === 'single' ? 'Scheduled Date' : 'Date Range'}</span>
              <span className="font-bold text-[#20251F]">
                {sessionType === 'single'
                  ? formatDisplayDate(startDate)
                  : formatDisplayDate(startDate) + ' → ' + formatDisplayDate(endDate)}
              </span>
            </div>
          )}
          {dailyStartTime && (
            <div className="flex justify-between text-xs">
              <span className="text-[#6B716B]">Time Window</span>
              <span className="font-bold text-[#20251F]">{formatEndTime(dailyStartTime, hoursPerDay)}</span>
            </div>
          )}
          {sessionType === 'multi' && startDate && endDate && (
            <div className="flex justify-between text-xs">
              <span className="text-[#6B716B]">Total Sessions</span>
              <span className="font-bold text-[#20251F]">{days} days</span>
            </div>
          )}
          <div className="border-t border-[#E8E5DE] pt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B716B]">Cost to You</span>
            <span className="text-base font-extrabold text-[#315B3B] bg-[#E8F0E7] px-3 py-0.5 rounded-full border border-[#315B3B]/20">
              FREE
            </span>
          </div>
        </div>

        {/* Free pledge */}
        <div className="flex items-center gap-3 bg-[#E8F0E7] border border-[#315B3B]/20 rounded-xl p-3.5">
          <CheckCircle2 size={16} className="text-[#315B3B] flex-shrink-0" />
          <p className="text-xs text-[#24452D] font-medium leading-relaxed">
            Tutoring sessions on Mentorly are strictly free for Gordon College students through SPECS.
          </p>
        </div>

        <button
          type="button"
          onClick={handleBooking}
          disabled={loading}
          className="w-full bg-[#F26A21] hover:bg-[#D95416] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-xs hover:shadow"
        >
          {loading ? 'Submitting request...' : 'Confirm Session Booking — Free'}
        </button>
      </div>
    </div>
  )
}