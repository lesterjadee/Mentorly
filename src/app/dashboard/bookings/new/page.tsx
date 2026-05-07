'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')

  const [service, setService] = useState<any>(null)
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
    async function fetchService() {
      if (!serviceId) return
      const supabase = createClient()
      const { data } = await supabase
        .from('services')
        .select('*, users(full_name, school, trust_score)')
        .eq('id', serviceId)
        .single()
      if (data) {
        setService(data)
        if (data.mode !== 'both') setMode(data.mode)
      }
    }
    fetchService()
  }, [serviceId])

  // calculate number of days between start and end (inclusive)
  function countDays() {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end < start) return 0
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff + 1
  }

  // format end time from start time + hours
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
  const totalPrice = service ? service.price_per_hour * parseFloat(hoursPerDay || '1') * (days || 1) : 0

  async function handleBooking() {
    if (!startDate || !dailyStartTime) {
      setError('Please fill in the date and time fields.')
      return
    }
    if (sessionType === 'multi' && !endDate) {
      setError('Please select an end date for multi-day sessions.')
      return
    }
    if (sessionType === 'multi' && new Date(endDate) < new Date(startDate)) {
      setError('End date must be on or after the start date.')
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (new Date(startDate) < today) {
      setError('Start date cannot be in the past.')
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
    const totalPriceCalc = service.price_per_hour * parseFloat(hoursPerDay) * totalDays

    const { error: bookingError } = await supabase.from('bookings').insert({
      service_id: serviceId,
      learner_id: user.id,
      tutor_id: service.tutor_id,
      scheduled_at: scheduledAt.toISOString(),
      duration_hours: parseFloat(hoursPerDay) * totalDays,
      mode,
      total_price: totalPriceCalc,
      notes,
      status: 'pending',
      session_type: sessionType,
      start_date: startDate,
      end_date: finalEndDate,
      daily_start_time: dailyStartTime,
      hours_per_day: parseFloat(hoursPerDay),
      total_days: totalDays,
    })

    if (bookingError) {
      setError(bookingError.message)
      setLoading(false)
    } else {
      router.push('/dashboard/bookings?success=true')
    }
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#26619C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/marketplace" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Book a session</h1>
          <p className="text-white/40 text-sm mt-1">Schedule your tutoring session</p>
        </div>
      </div>

      {/* service summary card */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-sm font-medium text-[#4a8fd4]">
          {service.users?.full_name?.[0]}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{service.title}</p>
          <p className="text-xs text-white/30 mt-0.5">
            with {service.users?.full_name} · {service.users?.school}
          </p>
        </div>
        <p className="text-sm font-semibold text-[#4a8fd4]">₱{service.price_per_hour}/hr</p>
      </div>

      {/* session type toggle */}
      <div className="grid grid-cols-2 gap-3 mb-6">
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

      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-5">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

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
            <Clock size={12} /> Start time (daily)
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
          <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">
            Hours per day
          </label>
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

        {/* session mode */}
        {service.mode === 'both' && (
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={12} /> Session mode
            </label>
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
            Notes for tutor — optional
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Topics to cover, your current level, anything the tutor should know..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
          />
        </div>

        {/* price + session summary */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-5 space-y-3">
          <p className="text-xs text-white/30 uppercase tracking-wider">Session summary</p>

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
              <span className="text-white/40">Time each day</span>
              <span className="text-white/70">{formatEndTime(dailyStartTime, hoursPerDay)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-white/40">Hours per day</span>
            <span className="text-white/70">{hoursPerDay} hr</span>
          </div>

          {sessionType === 'multi' && startDate && endDate && (
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Total days</span>
              <span className="text-white/70">{days} day{days !== 1 ? 's' : ''}</span>
            </div>
          )}

          <div className="border-t border-white/8 pt-3 flex justify-between items-center">
            <div>
              <p className="text-xs text-white/30">Total price</p>
              <p className="text-xs text-white/20 mt-0.5">
                ₱{service.price_per_hour}/hr × {hoursPerDay}hr
                {sessionType === 'multi' && days > 0 ? ' × ' + days + ' days' : ''}
              </p>
            </div>
            <p className="text-2xl font-bold text-[#4a8fd4]">₱{totalPrice.toFixed(2)}</p>
          </div>
        </div>

        <button
          onClick={handleBooking}
          disabled={loading}
          className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium"
        >
          {loading ? 'Sending request...' : 'Send booking request'}
        </button>
      </div>
    </div>
  )
}