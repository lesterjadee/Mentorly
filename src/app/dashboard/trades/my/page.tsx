import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftRight, Plus, ChevronRight, ArrowLeft } from 'lucide-react'

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

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/trades"
            className="w-10 h-10 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] transition-all shadow-xs"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">My Swaps</h1>
            <p className="text-[#6B716B] text-sm mt-0.5">Manage skill trades you've posted and requested</p>
          </div>
        </div>
        <Link
          href="/dashboard/trades/new"
          className="inline-flex items-center gap-2 bg-[#315B3B] hover:bg-[#24452D] text-white transition-colors px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus size={16} />
          New swap
        </Link>
      </div>

      {/* Swaps I Posted */}
      <div>
        <h2 className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-3">Swaps I Posted</h2>
        {myTrades && myTrades.length > 0 ? (
          <div className="space-y-3">
            {myTrades.map((trade: any) => (
              <div
                key={trade.id}
                className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-xs hover:border-[#315B3B]/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#F26A21] bg-[#FFF0E5] border border-[#F26A21]/20 px-3 py-1 rounded-lg">
                      Need: {trade.need_subject}
                    </span>
                    <ArrowLeftRight size={14} className="text-[#6B716B]" />
                    <span className="text-xs font-bold text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 px-3 py-1 rounded-lg">
                      Teach: {trade.offer_subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className={
                      'text-xs px-2.5 py-0.5 rounded-full font-semibold border ' +
                      (trade.status === 'open' ? 'border-[#315B3B]/20 text-[#315B3B] bg-[#E8F0E7]' :
                      trade.status === 'matched' ? 'border-[#F26A21]/20 text-[#F26A21] bg-[#FFF0E5]' :
                      'border-[#E8E5DE] text-[#6B716B] bg-[#F5F3ED]')
                    }>
                      {trade.status === 'open' ? 'Open' : trade.status === 'matched' ? 'Matched' : trade.status}
                    </span>
                    <Link
                      href={'/dashboard/trades/' + trade.id + '/requests'}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F3ED] hover:bg-[#E8E5DE] border border-[#E8E5DE] text-[#20251F] rounded-xl text-xs font-semibold transition-all shadow-xs"
                    >
                      <span>View requests</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-8 text-center shadow-xs">
            <p className="text-sm font-semibold text-[#20251F]">You haven't posted any swaps yet</p>
            <Link
              href="/dashboard/trades/new"
              className="text-[#315B3B] hover:underline text-xs font-semibold mt-2 inline-block"
            >
              Post your first skill swap
            </Link>
          </div>
        )}
      </div>

      {/* Swaps I Requested */}
      <div>
        <h2 className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-3">Swaps I Requested</h2>
        {myRequests && myRequests.length > 0 ? (
          <div className="space-y-3">
            {myRequests.map((req: any) => (
              <div
                key={req.id}
                className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#F26A21] bg-[#FFF0E5] px-2.5 py-0.5 rounded-md">
                        {req.trades?.need_subject}
                      </span>
                      <ArrowLeftRight size={13} className="text-[#6B716B]" />
                      <span className="text-xs font-bold text-[#315B3B] bg-[#E8F0E7] px-2.5 py-0.5 rounded-md">
                        {req.trades?.offer_subject}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B716B]">
                      Posted by <span className="font-medium text-[#20251F]">{req.trades?.users?.full_name}</span> · {req.trades?.users?.school}
                    </p>
                  </div>
                  <span className={
                    'text-xs px-2.5 py-0.5 rounded-full font-semibold border self-start sm:self-auto ' +
                    (req.status === 'pending' ? 'border-yellow-200 text-yellow-800 bg-yellow-50' :
                    req.status === 'accepted' ? 'border-[#315B3B]/20 text-[#315B3B] bg-[#E8F0E7]' :
                    'border-red-200 text-red-700 bg-red-50')
                  }>
                    {req.status === 'pending' ? 'Pending Partner Review' : req.status === 'accepted' ? 'Accepted' : 'Declined'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-8 text-center shadow-xs">
            <p className="text-sm font-semibold text-[#20251F]">You haven't requested any swaps yet</p>
            <Link
              href="/dashboard/trades"
              className="text-[#315B3B] hover:underline text-xs font-semibold mt-2 inline-block"
            >
              Browse skill swaps
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}