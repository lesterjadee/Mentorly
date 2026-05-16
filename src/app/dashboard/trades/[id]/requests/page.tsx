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
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/trades/my" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Swap requests</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-red-400">{trade.need_subject}</span>
            <ArrowLeftRight size={13} className="text-white/20" />
            <span className="text-sm text-green-400">{trade.offer_subject}</span>
          </div>
        </div>
      </div>

      {requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div
              key={req.id}
              className={
                'bg-white/3 border rounded-2xl p-6 transition-colors ' +
                (req.status === 'accepted' ? 'border-green-500/30 bg-green-500/5' :
                req.status === 'declined' ? 'border-red-500/20 opacity-60' :
                'border-white/8 hover:border-white/15')
              }
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-base font-medium text-teal-400 flex-shrink-0">
                    {req.requester?.full_name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{req.requester?.full_name}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {req.requester?.course} · {req.requester?.school}
                    </p>
                    <div className="mt-1.5">
                      <StarRating score={req.requester?.trust_score || 0} />
                    </div>
                  </div>
                </div>
                <div>
                  {req.status === 'pending' && (
                    <span className="text-xs text-yellow-400 border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                  {req.status === 'accepted' && (
                    <span className="text-xs text-green-400 border border-green-500/20 bg-green-500/10 px-2 py-1 rounded-full">
                      Accepted
                    </span>
                  )}
                  {req.status === 'declined' && (
                    <span className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 px-2 py-1 rounded-full">
                      Declined
                    </span>
                  )}
                </div>
              </div>

              {req.message && (
                <div className="bg-white/3 border border-white/8 rounded-xl p-3 mb-4">
                  <p className="text-xs text-white/50 leading-relaxed italic">"{req.message}"</p>
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
                  className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-2.5 rounded-xl text-xs font-medium text-white/50 hover:text-white"
                >
                  Message your swap partner
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
          <ArrowLeftRight size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No swap requests yet</p>
          <p className="text-white/20 text-xs mt-1">Students will send you requests once they see your swap post</p>
        </div>
      )}
    </div>
  )
}