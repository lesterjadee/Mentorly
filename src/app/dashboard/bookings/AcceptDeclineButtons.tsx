'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, X, CheckCircle } from 'lucide-react'

type Props = {
  bookingId: string
  status: string
  isLearner?: boolean
}

export default function AcceptDeclineButtons({ bookingId, status, isLearner }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(newStatus: string) {
    setLoading(newStatus)
    const supabase = createClient()
    await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)
    router.refresh()
    setLoading(null)
  }

  if (status === 'pending') {
    return (
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => updateStatus('accepted')}
          disabled={loading !== null}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Check size={11} />
          {loading === 'accepted' ? '...' : 'Accept'}
        </button>
        <button
          onClick={() => updateStatus('declined')}
          disabled={loading !== null}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          <X size={11} />
          {loading === 'declined' ? '...' : 'Decline'}
        </button>
      </div>
    )
  }

  if (status === 'accepted' && !isLearner) {
    return (
      <button
        onClick={() => updateStatus('completed')}
        disabled={loading !== null}
        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 mt-1"
      >
        <CheckCircle size={11} />
        {loading === 'completed' ? '...' : 'Mark complete'}
      </button>
    )
  }

  return null
}