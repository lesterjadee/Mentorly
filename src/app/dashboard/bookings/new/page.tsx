'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Clock, MapPin, Repeat } from 'lucide-react'
import Link from 'next/link'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')

  const [service, setService] = useState<any>(null)
  const [bookingType, setBookingType] = useState<'single' | 'multi'>('single')

  // single session
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('1')
  const [mode, setMode] = useState<'online' | 'in-person'>('online')
  const [notes, setNotes] = useState('')

  // multi-day session
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [dailyTime, setDailyTime] = useState('')
  const [dailyDuration, setDailyDuration] = useState('1')

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

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  function countSessionDays() {
    if (!startDate || !endDate || selectedDays.length === 0) return 0
    let count = 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayName = DAYS.find((day) => dayMap[day] === d.getDay())
      if (dayName && selectedDays.includes(dayName)) count++
    }
    return count
  }

  async function handleBooking() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (bookingType === 'single') {
      if (!date || !time) {
        setError('Please select a date and time.')
        setLoading(false)
        return
      }
      const scheduledAt = new Date(date + 'T' + time)
      if (scheduledAt < new Date()) {
        setError('Please select a future date and time.')
        setLoading(false)
        return
      }
      const totalPrice = service.price_per_hour * parseFloat(duration)
      const { error } = await supabase.from('bookings').insert({
        service_id: serviceId,
        learner_id: user.id,
        tutor_id: service.tutor_id,
        scheduled_at: scheduledAt.toISOString(),
        duration_hours: parseFloat(duration),
        mode,
        total_price: totalPrice,
        notes,
        status: 'pending',
        total_days: 1,
      })
      if (error) { setError(error.message); setLoading(false); return }

    } else {
      if (!startDate || !endDate || !dailyTime || selectedDays.length === 0) {
        setError('Please fill in all multi-day session fields.')
        setLoading(false)
        return
      }
      if (new Date(startDate) > new Date(endDate)) {
        setError('End date must be after start date.')
        setLoading(false)
        return
      }
      const sessionDays = countSessionDays()
      if (sessionDays === 0) {
        setError('No sessions fall on the selected days within the date range.')
        setLoading(false)
        return
      }
      const totalPrice = service.price_per_hour * parseFloat(dailyDuration) * sessionDays
      const scheduledAt = new Date(startDate + 'T' + dailyTime)
      const { error } = await supabase.from('bookings').insert({
        service_id: serviceId,
        learner_id: user.id,
        tutor_id: service.tutor_id,
        scheduled_at: scheduledAt.toISOString(),
        duration_hours: parseFloat(dailyDuration),
        mode,
        total_price: totalPrice,
        notes,
        status: 'pending',
        total_days: sessionDays,
        days_of_week: selectedDays,
        end_date: endDate,
      })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push('/dashboard/bookings?success=true')
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#26619C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const singleTotal = service.price_per_hour * parseFloat(duration || '1')
  const multiTotal = service.price_per_hour * parseFloat(dailyDuration || '1') * (countSessionDays() || 1)

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

      {/* service summary */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-sm font-medium text-[#4a8fd4]">
          {service.users?.full_name?.[0]}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{service.title}</p>
          <p className="text-xs text-white/30 mt-0.5">with {service.users?.full_name} · {service.users?.school}</p>
        </div>
        <p className="text-sm font-semibold text-[#4a8fd4]">₱{service.price_per_hour}/hr</p>
      </div>

      {/* booking type toggle */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setBookingType('single')}
          className={
            'flex items-center gap-2 justify-center py-3 rounded-xl border text-sm font-medium transition-all ' +
            (bookingType === 'single'
              ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
              : 'border-white/10 text-white/40 hover:border-white/20')
          }
        >
          <Calendar size={15} />
          Single session
        </button>
        <button
          onClick={() => setBookingType('multi')}
          className={
            'flex items-center gap-2 justify-center py-3 rounded-xl border text-sm font-medium transition-all ' +
            (bookingType === 'multi'
              ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
              : 'border-white/10 text-white/40 hover:border-white/20')
          }
        >
          <Repeat size={15} />
          Multi-day sessions
        </button>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-5">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {bookingType === 'single' ? (
          <>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar size={12} /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock size={12} /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Duration per session</label>
              <div className="grid grid-cols-4 gap-2">
                {['1', '1.5', '2', '3'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={
                      'py-2.5 rounded-xl border text-sm font-medium transition-all ' +
                      (duration === d
                        ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
                        : 'border-white/10 text-white/40 hover:border-white/20')
                    }
                  >
                    {d}hr
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
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

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Session days</label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={
                      'py-2.5 rounded-xl border text-xs font-medium transition-all ' +
                      (selectedDays.includes(day)
                        ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
                        : 'border-white/10 text-white/40 hover:border-white/20')
                    }
                  >
                    {day}
                  </button>
                ))}
              </div>
              {countSessionDays() > 0 && (
                <p className="text-xs text-[#4a8fd4] mt-2">
                  {countSessionDays()} sessions total within selected range
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock size={12} /> Daily start time
              </label>
              <input
                type="time"
                value={dailyTime}
                onChange={(e) => setDailyTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Hours per session</label>
              <div className="grid grid-cols-4 gap-2">
                {['1', '1.5', '2', '3'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDailyDuration(d)}
                    className={
                      'py-2.5 rounded-xl border text-sm font-medium transition-all ' +
                      (dailyDuration === d
                        ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
                        : 'border-white/10 text-white/40 hover:border-white/20')
                    }
                  >
                    {d}hr
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

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

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Notes for tutor — optional</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Topics you want to cover, your current level, questions you have..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
          />
        </div>

        {/* price summary */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          {bookingType === 'single' ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40">Total price</p>
                <p className="text-xs text-white/20 mt-0.5">₱{service.price_per_hour}/hr × {duration}hr</p>
              </div>
              <p className="text-xl font-bold text-[#4a8fd4]">₱{singleTotal.toFixed(2)}</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40">Total price</p>
                <p className="text-xs text-white/20 mt-0.5">
                  ₱{service.price_per_hour}/hr × {dailyDuration}hr × {countSessionDays() || '?'} sessions
                </p>
              </div>
              <p className="text-xl font-bold text-[#4a8fd4]">
                {countSessionDays() > 0 ? '₱' + multiTotal.toFixed(2) : '—'}
              </p>
            </div>
          )}
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