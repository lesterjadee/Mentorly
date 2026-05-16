import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftRight, Plus, ChevronRight } from 'lucide-react'

export default async function MyTradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myTrades } = await supabase
    .from('trades')
    .select('*')
    .eq('poster_id', user.id)
    .order('created_at', { ascending: false })

  const { data: myRequests } = await supabase
    .from('trade_requests')
    .select('*, trades(need_subject, offer_subject, status, poster_id, users!trades_poster_id_fkey(full_name, school))')
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  function getOfferCount(tradeId: string) {
    return 0
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Swaps</h1>
          <p className="text-white/40 text-sm mt-1">Swaps you've posted and requested</p>
        </div>
        <Link
          href="/dashboard/trades/new"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 transition-colors px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus size={16} />
          New swap
        </Link>
      </div>

      {/* my posted swaps */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Swaps I posted</h2>
        {myTrades && myTrades.length > 0 ? (
          <div className="space-y-3">
            {myTrades.map((trade: any) => (
              <div key={trade.id} className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-red-400">{trade.need_subject}</span>
                      <ArrowLeftRight size={14} className="text-white/20" />
                      <span className="text-sm font-medium text-green-400">{trade.offer_subject}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={
                      'text-xs px-2 py-1 rounded-full border ' +
                      (trade.status === 'open' ? 'border-green-500/20 text-green-400 bg-green-500/10' :
                      trade.status === 'matched' ? 'border-[#26619C]/20 text-[#4a8fd4] bg-[#26619C]/10' :
                      'border-white/10 text-white/30')
                    }>
                      {trade.status}
                    </span>
                    <Link
                      href={'/dashboard/trades/' + trade.id + '/requests'}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white rounded-xl text-xs font-medium transition-all"
                    >
                      View requests
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
            <p className="text-white/30 text-sm">You haven't posted any swaps yet</p>
            <Link href="/dashboard/trades/new" className="text-teal-400 hover:text-teal-300 text-sm mt-2 inline-block transition-colors">
              Post your first swap
            </Link>
          </div>
        )}
      </div>

      {/* swaps I requested */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Swaps I requested</h2>
        {myRequests && myRequests.length > 0 ? (
          <div className="space-y-3">
            {myRequests.map((req: any) => (
              <div key={req.id} className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-red-400">{req.trades?.need_subject}</span>
                      <ArrowLeftRight size={14} className="text-white/20" />
                      <span className="text-sm font-medium text-green-400">{req.trades?.offer_subject}</span>
                    </div>
                    <p className="text-xs text-white/30">
                      Posted by {req.trades?.users?.full_name} · {req.trades?.users?.school}
                    </p>
                  </div>
                  <span className={
                    'text-xs px-2 py-1 rounded-full border flex-shrink-0 ' +
                    (req.status === 'pending' ? 'border-yellow-500/20 text-yellow-400 bg-yellow-500/10' :
                    req.status === 'accepted' ? 'border-green-500/20 text-green-400 bg-green-500/10' :
                    'border-red-500/20 text-red-400 bg-red-500/10')
                  }>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
            <p className="text-white/30 text-sm">You haven't requested any swaps yet</p>
            <Link href="/dashboard/trades" className="text-teal-400 hover:text-teal-300 text-sm mt-2 inline-block transition-colors">
              Browse skill swaps
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}