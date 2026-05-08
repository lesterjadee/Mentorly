import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Star, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import OfferActionButtons from './OfferActionButtons'

export default async function RequestOffersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id: requestId } = await params

  const { data: request } = await supabase
    .from('requests')
    .select('*')
    .eq('id', requestId)
    .eq('learner_id', user.id)
    .single()

  if (!request) redirect('/dashboard/requests')

  const { data: offers } = await supabase
    .from('offers')
    .select('*, tutor:users!offers_tutor_id_fkey(id, full_name, school, course, trust_score)')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })

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

  function StarRating({ score }: { score: number }) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={11}
            className={s <= Math.round(score) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}
          />
        ))}
        <span className="text-xs text-white/40 ml-1">{score > 0 ? score : 'New'}</span>
      </div>
    )
  }

  const isMulti = request.session_type === 'multi'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/requests" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Incoming offers</h1>
          <p className="text-white/40 text-sm mt-1">{request.title}</p>
        </div>
      </div>

      {/* request schedule summary */}
      {request.start_date && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-4 mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Calendar size={12} className="text-white/20" />
            {isMulti
              ? formatDate(request.start_date) + ' → ' + formatDate(request.end_date)
              : formatDate(request.start_date)}
          </div>
          {request.daily_start_time && (
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Clock size={12} className="text-white/20" />
              {formatEndTime(request.daily_start_time, request.hours_per_day)} · {request.hours_per_day}hr/day
            </div>
          )}
          {isMulti && (
            <span className="text-xs text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-0.5 rounded-full">
              {request.total_days} day{request.total_days !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {offers && offers.length > 0 ? (
        <div className="space-y-4">
          {offers.map((offer: any) => {
            const estimatedTotal = offer.proposed_price * request.hours_per_day * (request.total_days || 1)
            const tutorScore = offer.tutor?.trust_score || 0

            return (
              <div
                key={offer.id}
                className={
                  'bg-white/3 border rounded-2xl p-6 transition-colors ' +
                  (offer.status === 'accepted'
                    ? 'border-green-500/30 bg-green-500/5'
                    : offer.status === 'declined'
                    ? 'border-red-500/20 opacity-60'
                    : 'border-white/8 hover:border-white/15')
                }
              >
                {/* tutor info */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-base font-medium text-[#4a8fd4] flex-shrink-0">
                      {offer.tutor?.full_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{offer.tutor?.full_name}</p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {offer.tutor?.course} · {offer.tutor?.school}
                      </p>
                      <div className="mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-white/30 uppercase tracking-wider">Trust score</span>
                          <StarRating score={tutorScore} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {offer.status === 'pending' && (
                      <span className="text-xs text-yellow-400 border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                    {offer.status === 'accepted' && (
                      <span className="text-xs text-green-400 border border-green-500/20 bg-green-500/10 px-2 py-1 rounded-full">
                        Accepted
                      </span>
                    )}
                    {offer.status === 'declined' && (
                      <span className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 px-2 py-1 rounded-full">
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* message */}
                {offer.message && (
                  <div className="bg-white/3 border border-white/8 rounded-xl p-3 mb-4">
                    <p className="text-xs text-white/50 leading-relaxed italic">"{offer.message}"</p>
                  </div>
                )}

                {/* price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-white/30">Proposed rate</p>
                    <p className="text-lg font-bold text-[#4a8fd4]">₱{offer.proposed_price}/hr</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/30">Estimated total</p>
                    <p className="text-lg font-bold text-white/70">₱{estimatedTotal.toFixed(2)}</p>
                  </div>
                </div>

                {/* action buttons */}
                {offer.status === 'pending' && (
                  <OfferActionButtons
                    offerId={offer.id}
                    tutorId={offer.tutor_id}
                    requestId={requestId}
                    request={request}
                    proposedPrice={offer.proposed_price}
                  />
                )}

                {offer.status === 'accepted' && (
                  <Link
                    href={'/dashboard/messages/' + offer.tutor_id}
                    className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-2.5 rounded-xl text-xs font-medium text-white/50 hover:text-white"
                  >
                    Message tutor
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
          <Star size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No offers yet</p>
          <p className="text-white/20 text-xs mt-1">Tutors will send you offers once they see your request</p>
        </div>
      )}
    </div>
  )
}