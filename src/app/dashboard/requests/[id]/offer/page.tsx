'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Clock, Send, ShieldCheck, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SendOfferPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string

  const [request, setRequest] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [alreadyOffered, setAlreadyOffered] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: req } = await supabase
        .from('requests')
        .select('*, users!requests_learner_id_fkey(full_name, school, course)')
        .eq('id', requestId)
        .single()

      if (req) setRequest(req)

      // check if already sent an offer
      const { data: existing } = await supabase
        .from('offers')
        .select('id')
        .eq('request_id', requestId)
        .eq('tutor_id', user.id)
        .single()

      if (existing) setAlreadyOffered(true)
      setFetching(false)
    }
    load()
  }, [requestId])

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

    const { error: offerError } = await supabase.from('offers').insert({
      request_id: requestId,
      tutor_id: user.id,
      learner_id: request.learner_id,
      message,
      proposed_price: 0,
      status: 'pending',
    })

    if (offerError) {
      if (offerError.code === '23505') {
        setError('You have already sent an offer for this request.')
      } else {
        setError(offerError.message)
      }
      setLoading(false)
    } else {
      router.push('/dashboard/requests/browse?offered=true')
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[#F26A21] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="text-center py-20 bg-white border border-[#E8E5DE] rounded-2xl p-8 max-w-lg mx-auto shadow-xs">
        <p className="text-[#6B716B] font-medium">Request not found or no longer available.</p>
        <Link href="/dashboard/requests/browse" className="text-[#F26A21] hover:underline text-sm mt-3 inline-block font-semibold">
          Back to browse
        </Link>
      </div>
    )
  }

  if (alreadyOffered) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/requests/browse"
            className="w-10 h-10 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] transition-all shadow-xs"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-[#20251F]">Send Offer</h1>
        </div>
        <div className="bg-[#E8F0E7] border border-[#315B3B]/30 rounded-2xl p-8 text-center shadow-xs">
          <ShieldCheck size={32} className="text-[#315B3B] mx-auto mb-2" />
          <h2 className="text-[#315B3B] font-bold text-base mb-1">Offer already sent</h2>
          <p className="text-[#20251F]/70 text-sm max-w-xs mx-auto">
            You've already submitted an offer for this student request. They will review your profile and respond soon.
          </p>
          <Link
            href="/dashboard/requests/browse"
            className="inline-block mt-4 bg-white border border-[#315B3B]/20 text-[#315B3B] hover:bg-[#315B3B] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            Browse other requests
          </Link>
        </div>
      </div>
    )
  }

  const isMulti = request.session_type === 'multi'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/requests/browse"
          className="w-10 h-10 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] transition-all shadow-xs"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">Send an Offer</h1>
          <p className="text-[#6B716B] text-sm mt-0.5">Offer your academic tutoring help to this student</p>
        </div>
      </div>

      {/* Request Summary Card */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center text-base font-bold text-[#315B3B] flex-shrink-0">
            {request.users?.full_name?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base text-[#20251F]">{request.title}</h2>
            <p className="text-xs text-[#6B716B] mt-0.5">
              Posted by {request.users?.full_name} · {request.users?.course} · {request.users?.school}
            </p>
            {request.description && (
              <p className="text-xs text-[#6B716B] mt-2.5 leading-relaxed bg-[#FFFCF7] p-3 rounded-xl border border-[#E8E5DE]">
                {request.description}
              </p>
            )}

            {/* Schedule */}
            {request.start_date && (
              <div className="bg-[#F5F3ED] border border-[#E8E5DE] rounded-xl p-3 mt-3 space-y-1.5">
                <p className="text-[10px] text-[#6B716B] font-bold uppercase tracking-wider mb-1">Requested schedule</p>
                <div className="flex items-center gap-2 text-xs text-[#20251F]">
                  <Calendar size={13} className="text-[#315B3B]" />
                  {isMulti
                    ? formatDate(request.start_date) + ' → ' + formatDate(request.end_date)
                    : formatDate(request.start_date)}
                  {isMulti && (
                    <span className="text-[#F26A21] border border-[#F26A21]/20 bg-[#FFF0E5] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      {request.total_days} day{request.total_days !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {request.daily_start_time && (
                  <div className="flex items-center gap-2 text-xs text-[#6B716B]">
                    <Clock size={13} className="text-[#F26A21]" />
                    {formatEndTime(request.daily_start_time, request.hours_per_day)} · {request.hours_per_day} hr/day
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-[#20251F] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-1 rounded-lg font-medium">
                {request.category}
              </span>
              <span className="text-xs text-[#20251F] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-1 rounded-lg capitalize font-medium">
                {request.mode}
              </span>
              <span className="text-xs text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-2.5 py-1 rounded-lg font-semibold">
                Free Peer Tutoring
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Form */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <p className="text-xs font-bold text-[#315B3B] uppercase tracking-wider">Your Peer Tutoring Offer</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">
            Message to Learner <span className="font-normal text-xs text-[#6B716B]/60">(Optional)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself, mention your course/grade in this topic, and share how you can help them prepare or succeed..."
            rows={4}
            className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-3 text-[#20251F] text-sm placeholder-[#6B716B]/50 focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all resize-none"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#F26A21] hover:bg-[#D95416] disabled:opacity-50 transition-colors py-3.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs"
        >
          <Send size={15} />
          {loading ? 'Sending Offer...' : 'Send Offer to Learner'}
        </button>
      </div>
    </div>
  )
}
