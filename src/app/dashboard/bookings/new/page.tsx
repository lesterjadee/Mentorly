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
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('1')
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

  async function handleBooking() {
    if (!date || !time) {
      setError('Please select a date and time.')
      return
    }

    const scheduledAt = new Date(date + 'T' + time)
    if (scheduledAt < new Date()) {
      setError('Please select a future date and time.')
      return
    }

    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check for overlapping bookings
    const endTime = new Date(scheduledAt.getTime() + parseFloat(duration) * 60 * 60 * 1000)
    const { data: overlapping } = await supabase
      .from('bookings')
      .select('id')
      .eq('tutor_id', service.tutor_id)
      .eq('status', 'accepted')
      .gte('scheduled_at', scheduledAt.toISOString())
      .lt('scheduled_at', endTime.toISOString())

    if (overlapping && overlapping.length > 0) {
      setError('This tutor already has a booking at that time. Please choose a different slot.')
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
    })

    if (error) {
      setError(error.message)
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

  const totalPrice = service.price_per_hour * parseFloat(duration || '1')

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

      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-5">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* date */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Calendar size={12} />
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
          />
        </div>

        {/* time */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Clock size={12} />
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
          />
        </div>

        {/* duration */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Duration</label>
          <div className="grid grid-cols-4 gap-2">
            {['1', '1.5', '2', '3'].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={
                  duration === d
                    ? 'py-2.5 rounded-xl border text-sm font-medium transition-all border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
                    : 'py-2.5 rounded-xl border text-sm font-medium transition-all border-white/10 text-white/40 hover:border-white/20'
                }
              >
                {d}hr
              </button>
            ))}
          </div>
        </div>

        {/* mode */}
        {service.mode === 'both' && (
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={12} />
              Session mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['online', 'in-person'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={
                    mode === m
                      ? 'py-2.5 rounded-xl border text-sm font-medium transition-all capitalize border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
                      : 'py-2.5 rounded-xl border text-sm font-medium transition-all capitalize border-white/10 text-white/40 hover:border-white/20'
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
        <div className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40">Total price</p>
            <p className="text-xs text-white/20 mt-0.5">₱{service.price_per_hour}/hr × {duration}hr</p>
          </div>
          <p className="text-xl font-bold text-[#4a8fd4]">₱{totalPrice.toFixed(2)}</p>
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