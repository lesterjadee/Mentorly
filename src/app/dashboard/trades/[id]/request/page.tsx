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
        <div className="w-5 h-5 border-2 border-[#315C36] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!trade) return null

  const isMulti = trade.session_type === 'multi'

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/trades"
          className="w-9 h-9 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] transition-all shadow-xs"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#20251F] tracking-tight leading-tight">Request a swap</h1>
          <p className="text-[#6B716B] text-xs mt-0.5">Send a match request to this student</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* trade summary */}
      <div className="lg:col-span-5 bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center text-sm font-bold text-[#315B3B]">
            {trade.users?.full_name?.[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-[#20251F]">{trade.users?.full_name}</p>
            <p className="text-xs text-[#6B716B]">{trade.users?.school}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex-1 bg-[#FFF0E5] border border-[#F26A21]/20 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[10px] text-[#F26A21] font-bold uppercase tracking-wider mb-0.5">Needs</p>
            <p className="text-xs font-bold text-[#20251F]">{trade.need_subject}</p>
          </div>
          <ArrowLeftRight size={15} className="text-[#6B716B] flex-shrink-0" />
          <div className="flex-1 bg-[#E8F0E7] border border-[#315B3B]/20 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[10px] text-[#315B3B] font-bold uppercase tracking-wider mb-0.5">Offers</p>
            <p className="text-xs font-bold text-[#20251F]">{trade.offer_subject}</p>
          </div>
        </div>

        {trade.start_date && (
          <div className="bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3 space-y-1.5">
            <p className="text-[10px] text-[#6B716B] font-bold uppercase tracking-wider">Schedule</p>
            <div className="flex items-center gap-2 text-xs text-[#20251F]">
              <Calendar size={12} className="text-[#315B3B]" />
              {isMulti
                ? formatDate(trade.start_date) + ' → ' + formatDate(trade.end_date)
                : formatDate(trade.start_date)}
            </div>
            {trade.daily_start_time && (
              <div className="flex items-center gap-2 text-xs text-[#6B716B]">
                <Clock size={12} className="text-[#F26A21]" />
                {formatEndTime(trade.daily_start_time, trade.hours_per_day)} · {trade.hours_per_day}hr/day
              </div>
            )}
          </div>
        )}

        {trade.description && (
          <p className="text-xs text-[#6B716B] mt-3 leading-relaxed">{trade.description}</p>
        )}
      </div>

      {/* request form */}
      <div className="lg:col-span-7 bg-white border border-[#E8E5DE] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-[#E8F0E7]/60 border border-[#315B3B]/20 rounded-xl p-4">
          <p className="text-xs text-[#24452D] leading-relaxed">
            By sending this request, you're agreeing to tutor{' '}
            <span className="text-[#315B3B] font-bold">{trade.users?.full_name?.split(' ')[0]}</span>{' '}
            in <span className="text-[#315B3B] font-bold">{trade.offer_subject}</span> in exchange for them
            tutoring you in <span className="text-[#F26A21] font-bold">{trade.need_subject}</span>.
            No payment is involved.
          </p>
        </div>

        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-1.5 block">
            Message — optional
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself and explain why you'd be a good match..."
            rows={5}
            className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-3 text-[#20251F] text-sm placeholder-[#6B716B]/50 focus:outline-none focus:border-[#315B3B] transition-colors resize-none"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#315B3B] hover:bg-[#24452D] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs"
        >
          <Send size={15} />
          {loading ? 'Sending request...' : 'Send swap request'}
        </button>
      </div>
      </div>
    </div>
  )
}