import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ArrowLeftRight, Calendar, Clock, Search, ShieldCheck } from 'lucide-react'

const SUBJECTS = [
  'All', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Filipino', 'History', 'Programming', 'Web Development',
  'Data Science', 'Design', 'Accounting', 'Economics', 'Other'
]

type Props = {
  searchParams: Promise<{ subject?: string; q?: string }>
}

export default async function TradesPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const selectedSubject = params.subject ?? 'All'
  const query = params.q ?? ''

  let dbQuery = supabase
    .from('trades')
    .select('*, users!trades_poster_id_fkey(id, full_name, school, course, trust_score)')
    .eq('status', 'open')

  if (selectedSubject !== 'All') {
    dbQuery = dbQuery.or(
      'need_subject.eq.' + selectedSubject + ',offer_subject.eq.' + selectedSubject
    )
  }
  if (query) {
    dbQuery = dbQuery.or(
      'need_subject.ilike.%' + query + '%,offer_subject.ilike.%' + query + '%,description.ilike.%' + query + '%'
    )
  }

  const { data: trades } = await dbQuery.order('created_at', { ascending: false })

  const { data: myTradeRequests } = await supabase
    .from('trade_requests')
    .select('trade_id')
    .eq('requester_id', user.id)

  const requestedTradeIds = new Set((myTradeRequests || []).map((r: any) => r.trade_id))

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'
    if (mins < 60) return mins + 'm ago'
    if (hours < 24) return hours + 'h ago'
    return days + 'd ago'
  }

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E7] text-[#315B3B] text-xs font-semibold mb-1">
            <ArrowLeftRight size={12} />
            Reciprocal Learning Exchange
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">Skill Swap</h1>
          <p className="text-[#6B716B] text-sm mt-0.5">Trade tutoring with another student — no fees, collaborative campus learning</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/trades/my"
            className="flex items-center gap-2 bg-white hover:bg-[#F5F3ED] border border-[#E8E5DE] transition-colors px-4 py-2.5 rounded-xl text-xs font-semibold text-[#20251F] shadow-xs"
          >
            My swaps
          </Link>
          <Link
            href="/dashboard/trades/new"
            className="flex items-center gap-2 bg-[#F26A21] hover:bg-[#D95416] transition-colors px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs"
          >
            <Plus size={16} />
            Post a swap
          </Link>
        </div>
      </div>

      {/* How it works banner */}
      <div className="bg-[#E8F0E7]/60 border border-[#315B3B]/20 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#315B3B]/20 flex items-center justify-center flex-shrink-0 text-[#315B3B] shadow-xs">
            <ArrowLeftRight size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#20251F] mb-1">How Skill Swap Works</h2>
            <p className="text-xs text-[#20251F]/70 leading-relaxed">
              Post what subject you need help with and what subject you can teach in return. Another student matches with you — you both tutor each other at no cost. Perfect for collaborative campus study!
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <form className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B716B]" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search skill swaps by subject or keyword..."
          className="w-full bg-white border border-[#E8E5DE] rounded-xl pl-11 pr-4 py-2.5 text-[#20251F] text-sm placeholder-[#6B716B]/60 focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all shadow-xs"
        />
        {selectedSubject !== 'All' && (
          <input type="hidden" name="subject" value={selectedSubject} />
        )}
      </form>

      {/* Subject Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SUBJECTS.map((sub) => {
          const isSelected = selectedSubject === sub
          return (
            <Link
              key={sub}
              href={'/dashboard/trades?subject=' + sub + (query ? '&q=' + query : '')}
              className={
                'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ' +
                (isSelected
                  ? 'bg-[#315B3B] border-[#315B3B] text-white shadow-xs'
                  : 'bg-white border-[#E8E5DE] text-[#6B716B] hover:border-[#315B3B]/30 hover:text-[#20251F]')
              }
            >
              {sub}
            </Link>
          )
        })}
      </div>

      {/* Trade Cards Grid */}
      {trades && trades.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {trades.map((trade: any) => {
            const isOwn = trade.poster_id === user.id
            const alreadyRequested = requestedTradeIds.has(trade.id)
            const isMulti = trade.session_type === 'multi'

            return (
              <div
                key={trade.id}
                className="bg-white border border-[#E8E5DE] rounded-2xl p-6 hover:border-[#315B3B]/40 hover:shadow-md transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Poster header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center text-sm font-bold text-[#315B3B] flex-shrink-0 shadow-xs">
                      {trade.users?.full_name?.[0] ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#20251F] truncate">{trade.users?.full_name}</p>
                      <p className="text-xs text-[#6B716B] truncate">{trade.users?.course} · {trade.users?.school}</p>
                    </div>
                    {isOwn && (
                      <span className="ml-auto text-[10px] font-semibold text-[#F26A21] border border-[#F26A21]/20 bg-[#FFF0E5] px-2.5 py-0.5 rounded-full flex-shrink-0">
                        Your swap
                      </span>
                    )}
                  </div>

                  {/* Swap Box */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-[#FFF0E5] border border-[#F26A21]/20 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-[#F26A21] uppercase font-bold tracking-wider mb-0.5">Needs help with</p>
                      <p className="text-xs font-bold text-[#20251F] truncate">{trade.need_subject}</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#F5F3ED] border border-[#E8E5DE] flex items-center justify-center flex-shrink-0 text-[#20251F]">
                      <ArrowLeftRight size={13} />
                    </div>
                    <div className="flex-1 bg-[#E8F0E7] border border-[#315B3B]/20 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-[#315B3B] uppercase font-bold tracking-wider mb-0.5">Can teach</p>
                      <p className="text-xs font-bold text-[#20251F] truncate">{trade.offer_subject}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {trade.description && (
                    <p className="text-xs text-[#6B716B] leading-relaxed mb-4 line-clamp-2">
                      {trade.description}
                    </p>
                  )}

                  {/* Schedule */}
                  {trade.start_date && (
                    <div className="bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3 mb-4 space-y-1.5 text-xs">
                      <p className="text-[10px] font-bold text-[#6B716B] uppercase tracking-wider">Preferred Schedule</p>
                      <div className="flex items-center gap-2 text-[#20251F]">
                        <Calendar size={12} className="text-[#315B3B]" />
                        {isMulti
                          ? formatDate(trade.start_date) + ' → ' + formatDate(trade.end_date)
                          : formatDate(trade.start_date)}
                        {isMulti && (
                          <span className="text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            {trade.total_days} days
                          </span>
                        )}
                      </div>
                      {trade.daily_start_time && (
                        <div className="flex items-center gap-2 text-[#6B716B]">
                          <Clock size={12} className="text-[#F26A21]" />
                          {formatEndTime(trade.daily_start_time, trade.hours_per_day)} · {trade.hours_per_day} hr/day
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E8E5DE]/60">
                  <p className="text-xs text-[#6B716B]/70">{timeAgo(trade.created_at)}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#20251F] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-1 rounded-lg capitalize">
                      {trade.mode}
                    </span>
                    {!isOwn && !alreadyRequested && (
                      <Link
                        href={'/dashboard/trades/' + trade.id + '/request'}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#315B3B] hover:bg-[#24452D] text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                      >
                        <ArrowLeftRight size={12} />
                        Request swap
                      </Link>
                    )}
                    {!isOwn && alreadyRequested && (
                      <span className="text-xs font-semibold text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 px-3 py-1.5 rounded-xl">
                        Swap requested
                      </span>
                    )}
                    {isOwn && (
                      <Link
                        href={'/dashboard/trades/' + trade.id + '/requests'}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F3ED] hover:bg-[#E8E5DE] border border-[#E8E5DE] text-[#20251F] rounded-xl text-xs font-semibold transition-all shadow-xs"
                      >
                        View requests
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center text-[#315B3B] mx-auto mb-4">
            <ArrowLeftRight size={24} />
          </div>
          <h2 className="text-base font-semibold text-[#20251F]">No skill swaps posted yet</h2>
          <p className="text-sm text-[#6B716B] mt-1 max-w-sm mx-auto mb-4">
            Be the first to trade tutoring in subjects you enjoy with other students!
          </p>
          <Link
            href="/dashboard/trades/new"
            className="inline-flex items-center gap-2 bg-[#315B3B] hover:bg-[#24452D] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus size={15} />
            Post a skill swap
          </Link>
        </div>
      )}
    </div>
  )
}