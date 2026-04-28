'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'

export default function AcceptDeclineButtons({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)

  async function updateStatus(status: 'accepted' | 'declined') {
    setLoading(status === 'accepted' ? 'accept' : 'decline')
    const supabase = createClient()
    await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="flex gap-2 mt-1">
      <button
        onClick={() => updateStatus('accepted')}
        disabled={loading !== null}
        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
      >
        <Check size={11} />
        {loading === 'accept' ? '...' : 'Accept'}
      </button>
      <button
        onClick={() => updateStatus('declined')}
        disabled={loading !== null}
        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
      >
        <X size={11} />
        {loading === 'decline' ? '...' : 'Decline'}
      </button>
    </div>
  )
}