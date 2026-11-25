import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Star, ArrowLeftRight } from 'lucide-react'
import Link from 'next/link'
import TradeRequestButtons from './TradeRequestButtons'

export default async function TradeRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id: tradeId } = await params

  const { data: trade } = await supabase
    .from('trades')
    .select('*')
    .eq('id', tradeId)
    .eq('poster_id', user.id)
    .single()

  if (!trade) redirect('/dashboard/trades')

  const { data: requests } = await supabase
    .from('trade_requests')
    .select('*, requester:users!trade_requests_requester_id_fkey(id, full_name, school, course, trust_score)')
    .eq('trade_id', tradeId)
    .order('created_at', { ascending: false })

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

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/trades/my"
          className="w-9 h-9 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] transition-all shadow-xs"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#20251F] tracking-tight leading-tight">Swap requests</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-[#F26A21] bg-[#FFF0E5] px-2.5 py-0.5 rounded-md">{trade.need_subject}</span>
            <ArrowLeftRight size={13} className="text-[#6B716B]" />
            <span className="text-xs font-bold text-[#315B3B] bg-[#E8F0E7] px-2.5 py-0.5 rounded-md">{trade.offer_subject}</span>
          </div>
        </div>
      </div>

      {requests && requests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requests.map((req: any) => (
            <div
              key={req.id}
              className={
                'bg-white border rounded-2xl p-5 transition-all shadow-xs ' +
                (req.status === 'accepted' ? 'border-[#315B3B] bg-[#E8F0E7]/20' :
                req.status === 'declined' ? 'border-[#E8E5DE] opacity-60' :
                'border-[#E8E5DE] hover:border-[#F26A21]/30')
              }
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center text-base font-bold text-[#315B3B] flex-shrink-0">
                    {req.requester?.full_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#20251F]">{req.requester?.full_name}</p>
                    <p className="text-xs text-[#6B716B] mt-0.5">
                      {req.requester?.course} · {req.requester?.school}
                    </p>
                    <div className="mt-1.5">
                      <StarRating score={req.requester?.trust_score || 0} />
                    </div>
                  </div>
                </div>
                <div>
                  {req.status === 'pending' && (
                    <span className="text-xs text-[#F26A21] border border-[#F26A21]/20 bg-[#FFF0E5] px-2.5 py-1 rounded-full font-semibold">
                      Pending
                    </span>
                  )}
                  {req.status === 'accepted' && (
                    <span className="text-xs text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-2.5 py-1 rounded-full font-semibold">
                      Accepted
                    </span>
                  )}
                  {req.status === 'declined' && (
                    <span className="text-xs text-[#6B716B] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-1 rounded-full font-medium">
                      Declined
                    </span>
                  )}
                </div>
              </div>

              {req.message && (
                <div className="bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3 mb-4">
                  <p className="text-xs text-[#20251F] leading-relaxed italic">"{req.message}"</p>
                </div>
              )}

              {req.status === 'pending' && (
                <TradeRequestButtons
                  requestId={req.id}
                  requesterId={req.requester_id}
                  tradeId={tradeId}
                  trade={trade}
                />
              )}

              {req.status === 'accepted' && (
                <Link
                  href={'/dashboard/messages/' + req.requester_id}
                  className="block w-full text-center bg-[#315B3B] hover:bg-[#24452D] transition-colors py-2.5 rounded-xl text-xs font-semibold text-white"
                >
                  Message your swap partner
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full bg-white border border-[#E8E5DE] rounded-2xl p-8 sm:p-10 text-center shadow-xs">
          <ArrowLeftRight size={28} className="text-[#939A92] mx-auto mb-3" />
          <p className="text-[#20251F] font-semibold text-sm">No swap requests yet</p>
          <p className="text-[#6B716B] text-xs mt-1">Students will send you requests once they see your swap post</p>
        </div>
      )}
    </div>
  )
}