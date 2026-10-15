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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F0E7] hover:bg-[#D4E4D3] border border-[#315B3B]/30 text-[#315B3B] rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shadow-2xs"
        >
          <Check size={13} />
          {loading === 'accepted' ? 'Updating...' : 'Accept'}
        </button>
        <button
          onClick={() => updateStatus('declined')}
          disabled={loading !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shadow-2xs"
        >
          <X size={13} />
          {loading === 'declined' ? 'Updating...' : 'Decline'}
        </button>
      </div>
    )
  }

  if (status === 'accepted' && !isLearner) {
    return (
      <button
        onClick={() => updateStatus('completed')}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0E5] hover:bg-[#FFE3D0] border border-[#F26A21]/30 text-[#D95416] rounded-lg text-xs font-semibold transition-all disabled:opacity-50 mt-1 shadow-2xs"
      >
        <CheckCircle size={13} />
        {loading === 'completed' ? 'Updating...' : 'Mark Completed'}
      </button>
    )
  }

  return null
}