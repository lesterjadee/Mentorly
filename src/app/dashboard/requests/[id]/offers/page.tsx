import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, User, Calendar, Clock, MessageSquare, CheckCircle } from 'lucide-react'
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
    .select('*, tutor:users!offers_tutor_id_fkey(id, full_name, school, course)')
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

  const isMulti = request.session_type === 'multi'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/requests"
          className="w-10 h-10 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] transition-all shadow-xs"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">Incoming Offers</h1>
          <p className="text-[#6B716B] text-sm mt-0.5">{request.title}</p>
        </div>
      </div>

      {/* Request Schedule Summary */}
      {request.start_date && (
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-xs text-xs">
          <div className="flex items-center gap-2 text-[#20251F] font-medium">
            <Calendar size={13} className="text-[#315B3B]" />
            {isMulti
              ? formatDate(request.start_date) + ' → ' + formatDate(request.end_date)
              : formatDate(request.start_date)}
          </div>
          {request.daily_start_time && (
            <div className="flex items-center gap-2 text-[#6B716B]">
              <Clock size={13} className="text-[#F26A21]" />
              {formatEndTime(request.daily_start_time, request.hours_per_day)} · {request.hours_per_day} hr/day
            </div>
          )}
          {isMulti && (
            <span className="text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-2.5 py-0.5 rounded-full font-semibold">
              {request.total_days} days total
            </span>
          )}
        </div>
      )}

      {/* Offers List */}
      {offers && offers.length > 0 ? (
        <div className="space-y-4">
          {offers.map((offer: any) => {
            const isAccepted = offer.status === 'accepted'
            const isDeclined = offer.status === 'declined'

            return (
              <div
                key={offer.id}
                className={
                  'bg-white border rounded-2xl p-6 transition-all shadow-xs ' +
                  (isAccepted
                    ? 'border-[#315B3B] bg-[#E8F0E7]/20 ring-1 ring-[#315B3B]/20'
                    : isDeclined
                    ? 'border-[#E8E5DE] opacity-60 bg-[#F5F3ED]'
                    : 'border-[#E8E5DE] hover:border-[#F26A21]/40 hover:shadow-md')
                }
              >
                {/* Tutor Info */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-base font-bold text-[#F26A21] flex-shrink-0">
                      {offer.tutor?.full_name?.[0] ?? '?'}
                    </div>
                    <div>
                      <h2 className="font-semibold text-base text-[#20251F]">{offer.tutor?.full_name}</h2>
                      <p className="text-xs text-[#6B716B] mt-0.5">
                        {offer.tutor?.course} · {offer.tutor?.school}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {offer.status === 'pending' && (
                      <span className="text-xs text-[#F26A21] border border-[#F26A21]/20 bg-[#FFF0E5] px-3 py-1 rounded-full font-semibold">
                        Pending Review
                      </span>
                    )}
                    {offer.status === 'accepted' && (
                      <span className="text-xs text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                        <CheckCircle size={12} />
                        Accepted
                      </span>
                    )}
                    {offer.status === 'declined' && (
                      <span className="text-xs text-[#6B716B] border border-[#E8E5DE] bg-[#F5F3ED] px-3 py-1 rounded-full font-medium">
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Message */}
                {offer.message && (
                  <div className="bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3.5 mb-4">
                    <p className="text-xs text-[#20251F] leading-relaxed italic">"{offer.message}"</p>
                  </div>
                )}

                {/* Action Buttons */}
                {offer.status === 'pending' && (
                  <OfferActionButtons
                    offerId={offer.id}
                    tutorId={offer.tutor_id}
                    requestId={requestId}
                    request={request}
                  />
                )}

                {offer.status === 'accepted' && (
                  <Link
                    href={'/dashboard/messages/' + offer.tutor_id}
                    className="flex items-center justify-center gap-2 w-full text-center bg-[#315B3B] hover:bg-[#24452D] text-white transition-colors py-2.5 rounded-xl text-xs font-semibold shadow-xs"
                  >
                    <MessageSquare size={14} />
                    Message tutor
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-[#F26A21] mx-auto mb-4">
            <User size={24} />
          </div>
          <h3 className="text-base font-semibold text-[#20251F]">No offers yet</h3>
          <p className="text-[#6B716B] text-sm mt-1 max-w-sm mx-auto">
            Peer tutors will review your request and send support offers soon. Check back shortly!
          </p>
        </div>
      )}
    </div>
  )
}
