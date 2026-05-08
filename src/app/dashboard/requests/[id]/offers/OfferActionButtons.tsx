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

  async function handleAccept() {
    setLoading('accept')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1 — accept this offer
    await supabase
      .from('offers')
      .update({ status: 'accepted' })
      .eq('id', offerId)

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

    // 4 — auto-create a booking from the accepted offer
    const scheduledAt = new Date(request.start_date + 'T' + (request.daily_start_time || '08:00'))
    const totalDays = request.total_days || 1
    const totalPrice = proposedPrice * request.hours_per_day * totalDays

    await supabase.from('bookings').insert({
      learner_id: user.id,
      tutor_id: tutorId,
      service_id: null,
      scheduled_at: scheduledAt.toISOString(),
      duration_hours: request.hours_per_day * totalDays,
      mode: request.mode === 'both' ? 'online' : request.mode,
      total_price: totalPrice,
      notes: request.description || '',
      status: 'accepted',
      session_type: request.session_type || 'single',
      start_date: request.start_date,
      end_date: request.end_date || request.start_date,
      daily_start_time: request.daily_start_time,
      hours_per_day: request.hours_per_day,
      total_days: totalDays,
    })

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
  )
}