import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ArrowLeftRight, Calendar, Clock, Search } from 'lucide-react'

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
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Skill Swap</h1>
          <p className="text-white/40 text-sm">Trade tutoring with another student — no fees, just learning</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/trades/my"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white"
          >
            My swaps
          </Link>
          <Link
            href="/dashboard/trades/new"
            className="flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] transition-colors px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            <Plus size={16} />
            Post a swap
          </Link>
        </div>
      </div>

      {/* how it works banner */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
            <ArrowLeftRight size={16} className="text-teal-400" />
          </div>
          <div>
            <p className="font-medium text-sm mb-1">How Skill Swap works</p>
            <p className="text-xs text-white/40 leading-relaxed">
              Post what subject you need help with and what subject you can teach in return.
              Another student matches with you — you both tutor each other at no cost.
              Perfect for students who want to learn without spending money.
            </p>
          </div>
        </div>
      </div>

      {/* search */}
      <form className="relative mb-6">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by subject or description..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
        />
        {selectedSubject !== 'All' && (
          <input type="hidden" name="subject" value={selectedSubject} />
        )}
      </form>

      {/* subject filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {SUBJECTS.map((sub) => (
          <Link
            key={sub}
            href={'/dashboard/trades?subject=' + sub + (query ? '&q=' + query : '')}
            className={
              selectedSubject === sub
                ? 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-teal-500 border-teal-500 text-white'
                : 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
            }
          >
            {sub}
          </Link>
        ))}
      </div>

      {/* trade cards */}
      {trades && trades.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {trades.map((trade: any) => {
            const isOwn = trade.poster_id === user.id
            const alreadyRequested = requestedTradeIds.has(trade.id)
            const isMulti = trade.session_type === 'multi'

            return (
              <div
                key={trade.id}
                className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-teal-500/20 transition-colors"
              >
                {/* poster */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-sm font-medium text-teal-400 flex-shrink-0">
                    {trade.users?.full_name?.[0] ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{trade.users?.full_name}</p>
                    <p className="text-xs text-white/30 truncate">{trade.users?.school}</p>
                  </div>
                  {isOwn && (
                    <span className="ml-auto text-[10px] text-purple-400 border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      Your swap
                    </span>
                  )}
                </div>

                {/* swap arrow */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-[10px] text-red-400/60 uppercase tracking-wider mb-1">Needs help with</p>
                    <p className="text-sm font-semibold text-red-400">{trade.need_subject}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowLeftRight size={16} className="text-white/20" />
                  </div>
                  <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-[10px] text-green-400/60 uppercase tracking-wider mb-1">Can teach</p>
                    <p className="text-sm font-semibold text-green-400">{trade.offer_subject}</p>
                  </div>
                </div>

                {/* description */}
                {trade.description && (
                  <p className="text-xs text-white/30 leading-relaxed mb-4 line-clamp-2">
                    {trade.description}
                  </p>
                )}

                {/* schedule */}
                {trade.start_date && (
                  <div className="bg-white/3 border border-white/8 rounded-xl p-3 mb-4 space-y-1.5">
                    <p className="text-[10px] text-white/20 uppercase tracking-wider">Schedule</p>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Calendar size={11} />
                      {isMulti
                        ? formatDate(trade.start_date) + ' → ' + formatDate(trade.end_date)
                        : formatDate(trade.start_date)}
                      {isMulti && (
                        <span className="text-teal-400 border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 rounded-full text-[10px]">
                          {trade.total_days} day{trade.total_days !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {trade.daily_start_time && (
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Clock size={11} />
                        {formatEndTime(trade.daily_start_time, trade.hours_per_day)} · {trade.hours_per_day}hr/day
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/20">{timeAgo(trade.created_at)}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/20 border border-white/8 px-2 py-1 rounded-lg capitalize">
                      {trade.mode}
                    </span>
                    {!isOwn && !alreadyRequested && (
                      <Link
                        href={'/dashboard/trades/' + trade.id + '/request'}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-500/40 text-teal-400 rounded-xl text-xs font-medium transition-all"
                      >
                        <ArrowLeftRight size={12} />
                        Request swap
                      </Link>
                    )}
                    {!isOwn && alreadyRequested && (
                      <span className="text-xs text-white/20 border border-white/8 px-3 py-1.5 rounded-xl">
                        Swap requested
                      </span>
                    )}
                    {isOwn && (
                      <Link
                        href={'/dashboard/trades/' + trade.id + '/requests'}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white rounded-xl text-xs font-medium transition-all"
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
        <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
          <ArrowLeftRight size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No skill swaps posted yet</p>
          <p className="text-white/20 text-xs mt-1">Be the first to post a swap!</p>
          <Link
            href="/dashboard/trades/new"
            className="inline-block mt-4 text-teal-400 hover:text-teal-300 text-sm transition-colors"
          >
            Post a skill swap
          </Link>
        </div>
      )}
    </div>
  )
}