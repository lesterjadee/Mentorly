'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Clock, Send } from 'lucide-react'
import Link from 'next/link'

export default function SendOfferPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string

  const [request, setRequest] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [proposedPrice, setProposedPrice] = useState('')
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

      if (req) {
        setRequest(req)
        if (req.budget) setProposedPrice(req.budget.toString())
      }

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
    if (!proposedPrice) {
      setError('Please enter your proposed rate.')
      return
    }
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
      proposed_price: parseFloat(proposedPrice),
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
        <div className="w-5 h-5 border-2 border-[#26619C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40">Request not found.</p>
        <Link href="/dashboard/requests/browse" className="text-[#26619C] text-sm mt-3 inline-block">Back to browse</Link>
      </div>
    )
  }

  if (alreadyOffered) {
    return (
      <div className="max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/requests/browse" className="text-white/30 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold">Send offer</h1>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 text-center">
          <p className="text-yellow-400 font-medium mb-2">Offer already sent</p>
          <p className="text-white/40 text-sm">You've already sent an offer for this request. Wait for the learner to respond.</p>
          <Link href="/dashboard/requests/browse" className="inline-block mt-4 text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors">
            Back to browse
          </Link>
        </div>
      </div>
    )
  }

  const isMulti = request.session_type === 'multi'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/requests/browse" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Send an offer</h1>
          <p className="text-white/40 text-sm mt-1">Respond to this learner's request</p>
        </div>
      </div>

      {/* request summary */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm font-medium text-purple-400 flex-shrink-0">
            {request.users?.full_name?.[0]}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{request.title}</p>
            <p className="text-xs text-white/30 mt-0.5">
              {request.users?.full_name} · {request.users?.school}
            </p>
            {request.description && (
              <p className="text-xs text-white/30 mt-2 leading-relaxed">{request.description}</p>
            )}

            {/* schedule */}
            {request.start_date && (
              <div className="bg-white/3 border border-white/8 rounded-xl p-3 mt-3 space-y-1.5">
                <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1">Requested schedule</p>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Calendar size={11} className="text-white/30" />
                  {isMulti
                    ? formatDate(request.start_date) + ' → ' + formatDate(request.end_date)
                    : formatDate(request.start_date)}
                  {isMulti && (
                    <span className="text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-0.5 rounded-full text-[10px]">
                      {request.total_days} day{request.total_days !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {request.daily_start_time && (
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Clock size={11} className="text-white/30" />
                    {formatEndTime(request.daily_start_time, request.hours_per_day)} · {request.hours_per_day}hr/day
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg">{request.category}</span>
              <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg capitalize">{request.mode}</span>
              {request.budget && (
                <span className="text-xs text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-1 rounded-lg">
                  Learner budget: ₱{request.budget}/hr
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* offer form */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-5">
        <p className="text-xs text-white/30 uppercase tracking-wider">Your offer</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
            Your rate (₱/hr) *
          </label>
          <input
            type="number"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
            placeholder="e.g. 150"
            min="0"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
          />
          {request.budget && parseFloat(proposedPrice) > request.budget && (
            <p className="text-xs text-yellow-400 mt-2">
              ⚠ Your rate is above the learner's budget of ₱{request.budget}/hr
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
            Message to learner — optional
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself, describe your experience with this subject, and why you'd be a great fit..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
          />
        </div>

        {/* total estimate */}
        {proposedPrice && request.start_date && (
          <div className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40">Estimated total</p>
              <p className="text-xs text-white/20 mt-0.5">
                ₱{proposedPrice}/hr × {request.hours_per_day}hr × {request.total_days || 1} day{(request.total_days || 1) !== 1 ? 's' : ''}
              </p>
            </div>
            <p className="text-xl font-bold text-[#4a8fd4]">
              ₱{(parseFloat(proposedPrice) * request.hours_per_day * (request.total_days || 1)).toFixed(2)}
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
        >
          <Send size={15} />
          {loading ? 'Sending offer...' : 'Send offer to learner'}
        </button>
      </div>
    </div>
  )
}