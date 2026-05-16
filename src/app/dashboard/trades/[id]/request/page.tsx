'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowLeftRight, Calendar, Clock, Send } from 'lucide-react'
import Link from 'next/link'

export default function RequestSwapPage() {
  const router = useRouter()
  const params = useParams()
  const tradeId = params.id as string

  const [trade, setTrade] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('trades')
        .select('*, users!trades_poster_id_fkey(full_name, school, course)')
        .eq('id', tradeId)
        .single()
      if (data) setTrade(data)
      setFetching(false)
    }
    load()
  }, [tradeId])

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  function formatEndTime(startTime: string, hours: number) {
    if (!startTime || !hours) return '—'
    const [h, m] = startTime.split(':').map(Number)
    const totalMins = h * 60 + m + hours * 60
    const endH = Math.floor(totalMins / 60) % 24
    const endM = totalMins % 60
    const period = (t: number) => t >= 12 ? 'PM' : 'AM'
    const fmt = (t: number) => t % 12 === 0 ? 12 : t % 12
    return fmt(h) + ':' + String(m).padStart(2, '0') + ' ' + period(h) + ' – ' + fmt(endH) + ':' + String(endM).padStart(2, '0') + ' ' + period(endH)
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: insertError } = await supabase.from('trade_requests').insert({
      trade_id: tradeId,
      requester_id: user.id,
      poster_id: trade.poster_id,
      message,
      status: 'pending',
    })

    if (insertError) {
      if (insertError.code === '23505') {
        setError('You have already requested this swap.')
      } else {
        setError(insertError.message)
      }
      setLoading(false)
    } else {
      router.push('/dashboard/trades?requested=true')
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!trade) return null

  const isMulti = trade.session_type === 'multi'

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/trades" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Request a swap</h1>
          <p className="text-white/40 text-sm mt-1">Send a match request to this student</p>
        </div>
      </div>

      {/* trade summary */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-sm font-medium text-teal-400">
            {trade.users?.full_name?.[0]}
          </div>
          <div>
            <p className="text-sm font-medium">{trade.users?.full_name}</p>
            <p className="text-xs text-white/30">{trade.users?.school}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[10px] text-red-400/60 uppercase tracking-wider mb-1">Needs</p>
            <p className="text-sm font-semibold text-red-400">{trade.need_subject}</p>
          </div>
          <ArrowLeftRight size={16} className="text-white/20 flex-shrink-0" />
          <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[10px] text-green-400/60 uppercase tracking-wider mb-1">Offers</p>
            <p className="text-sm font-semibold text-green-400">{trade.offer_subject}</p>
          </div>
        </div>

        {trade.start_date && (
          <div className="bg-white/3 border border-white/8 rounded-xl p-3 space-y-1.5">
            <p className="text-[10px] text-white/20 uppercase tracking-wider">Schedule</p>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Calendar size={11} />
              {isMulti
                ? formatDate(trade.start_date) + ' → ' + formatDate(trade.end_date)
                : formatDate(trade.start_date)}
            </div>
            {trade.daily_start_time && (
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Clock size={11} />
                {formatEndTime(trade.daily_start_time, trade.hours_per_day)} · {trade.hours_per_day}hr/day
              </div>
            )}
          </div>
        )}

        {trade.description && (
          <p className="text-xs text-white/30 mt-3 leading-relaxed">{trade.description}</p>
        )}
      </div>

      {/* request form */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-5">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-4">
          <p className="text-xs text-teal-400/70 leading-relaxed">
            By sending this request, you're agreeing to tutor{' '}
            <span className="text-teal-400 font-medium">{trade.users?.full_name?.split(' ')[0]}</span>{' '}
            in <span className="text-teal-400 font-medium">{trade.offer_subject}</span> in exchange for them
            tutoring you in <span className="text-teal-400 font-medium">{trade.need_subject}</span>.
            No payment is involved.
          </p>
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
            Message — optional
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself and explain why you'd be a good match..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-teal-500/40 transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
        >
          <Send size={15} />
          {loading ? 'Sending request...' : 'Send swap request'}
        </button>
      </div>
    </div>
  )
}