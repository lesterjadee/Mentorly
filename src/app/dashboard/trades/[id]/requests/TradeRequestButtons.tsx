'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, X } from 'lucide-react'

type Props = {
  requestId: string
  requesterId: string
  tradeId: string
  trade: any
}

export default function TradeRequestButtons({ requestId, requesterId, tradeId, trade }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)
  const [error, setError] = useState('')

  async function handleAccept() {
    setLoading('accept')
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1 — accept this request
    await supabase
      .from('trade_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    // 2 — decline all other pending requests
    await supabase
      .from('trade_requests')
      .update({ status: 'declined' })
      .eq('trade_id', tradeId)
      .neq('id', requestId)
      .eq('status', 'pending')

    // 3 — mark trade as matched
    await supabase
      .from('trades')
      .update({ status: 'matched' })
      .eq('id', tradeId)

    // 4 — create a booking for the poster (as learner of the requester's subject)
    const scheduledAt = new Date(
      trade.start_date + 'T' + (trade.daily_start_time || '08:00:00')
    ).toISOString()
    const totalDays = trade.total_days || 1
    const hoursPerDay = trade.hours_per_day || 1

    // poster gets tutored by requester (poster needs help, requester provides it)
    await supabase.from('bookings').insert({
      learner_id: user.id,
      tutor_id: requesterId,
      service_id: null,
      booking_title: 'Skill Swap: ' + trade.need_subject + ' ↔ ' + trade.offer_subject,
      scheduled_at: scheduledAt,
      duration_hours: hoursPerDay * totalDays,
      mode: trade.mode === 'both' ? 'online' : trade.mode,
      total_price: 0,
      notes: 'Skill swap — no payment required.',
      status: 'accepted',
      session_type: trade.session_type || 'single',
      start_date: trade.start_date,
      end_date: trade.end_date || trade.start_date,
      daily_start_time: trade.daily_start_time || '08:00:00',
      hours_per_day: hoursPerDay,
      total_days: totalDays,
    })

    // requester gets tutored by poster (requester needs what poster offers)
    await supabase.from('bookings').insert({
      learner_id: requesterId,
      tutor_id: user.id,
      service_id: null,
      booking_title: 'Skill Swap: ' + trade.offer_subject + ' ↔ ' + trade.need_subject,
      scheduled_at: scheduledAt,
      duration_hours: hoursPerDay * totalDays,
      mode: trade.mode === 'both' ? 'online' : trade.mode,
      total_price: 0,
      notes: 'Skill swap — no payment required.',
      status: 'accepted',
      session_type: trade.session_type || 'single',
      start_date: trade.start_date,
      end_date: trade.end_date || trade.start_date,
      daily_start_time: trade.daily_start_time || '08:00:00',
      hours_per_day: hoursPerDay,
      total_days: totalDays,
    })

    router.refresh()
    setLoading(null)
  }

  async function handleDecline() {
    setLoading('decline')
    const supabase = createClient()
    await supabase
      .from('trade_requests')
      .update({ status: 'declined' })
      .eq('id', requestId)
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
          {loading === 'accept' ? 'Accepting...' : 'Accept swap'}
        </button>
      </div>
    </div>
  )
}