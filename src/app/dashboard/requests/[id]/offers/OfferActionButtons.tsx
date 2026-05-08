'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, X } from 'lucide-react'

type Props = {
  offerId: string
  tutorId: string
  requestId: string
  request: any
  proposedPrice: number
}

export default function OfferActionButtons({
  offerId,
  tutorId,
  requestId,
  request,
  proposedPrice,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)
  const [error, setError] = useState('')

  async function handleAccept() {
    setLoading('accept')
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1 — accept this offer
    const { error: offerError } = await supabase
      .from('offers')
      .update({ status: 'accepted' })
      .eq('id', offerId)

    if (offerError) {
      setError('Failed to accept offer: ' + offerError.message)
      setLoading(null)
      return
    }

    // 2 — decline all other pending offers for this request
    await supabase
      .from('offers')
      .update({ status: 'declined' })
      .eq('request_id', requestId)
      .neq('id', offerId)
      .eq('status', 'pending')

    // 3 — close the request
    await supabase
      .from('requests')
      .update({ status: 'closed' })
      .eq('id', requestId)

    // 4 — create booking
    const scheduledAt = new Date(
      request.start_date + 'T' + (request.daily_start_time || '08:00:00')
    ).toISOString()

    const totalDays = request.total_days || 1
    const hoursPerDay = request.hours_per_day || 1
    const totalPrice = proposedPrice * hoursPerDay * totalDays

    const { error: bookingError } = await supabase.from('bookings').insert({
      learner_id: user.id,
      tutor_id: tutorId,
      service_id: null,
      request_id: requestId,
      booking_title: request.title,
      scheduled_at: scheduledAt,
      duration_hours: hoursPerDay * totalDays,
      mode: request.mode === 'both' ? 'online' : request.mode,
      total_price: totalPrice,
      notes: request.description || '',
      status: 'accepted',
      session_type: request.session_type || 'single',
      start_date: request.start_date,
      end_date: request.end_date || request.start_date,
      daily_start_time: request.daily_start_time || '08:00:00',
      hours_per_day: hoursPerDay,
      total_days: totalDays,
    })

    if (bookingError) {
      setError('Offer accepted but booking failed: ' + bookingError.message)
      setLoading(null)
      return
    }

    router.push('/dashboard/bookings')
    router.refresh()
    setLoading(null)
  }

  async function handleDecline() {
    setLoading('decline')
    const supabase = createClient()
    await supabase
      .from('offers')
      .update({ status: 'declined' })
      .eq('id', offerId)
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleDecline}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
        >
          <X size={13} />
          {loading === 'decline' ? 'Declining...' : 'Decline'}
        </button>
        <button
          onClick={handleAccept}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Check size={13} />
          {loading === 'accept' ? 'Accepting...' : 'Accept offer'}
        </button>
      </div>
    </div>
  )
}