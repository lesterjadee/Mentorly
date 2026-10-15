import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookOpen, Search, Calendar, Clock, CheckCircle, GraduationCap, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  'All', 'Mathematics', 'Science', 'Physics', 'Chemistry',
  'Biology', 'Programming', 'Web Development', 'English', 'Other'
]

type Props = {
  searchParams: Promise<{ category?: string; q?: string; offered?: string }>
}

export default async function BrowseRequestsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const selectedCategory = params.category ?? 'All'
  const query = params.q ?? ''
  const justOffered = params.offered === 'true'

  let dbQuery = supabase
    .from('requests')
    .select('*, users!requests_learner_id_fkey(id, full_name, school, course, trust_score)')
    .eq('status', 'open')

  if (selectedCategory !== 'All') {
    dbQuery = dbQuery.eq('category', selectedCategory)
  }
  if (query) {
    dbQuery = dbQuery.ilike('title', '%' + query + '%')
  }

  const { data: requests } = await dbQuery.order('created_at', { ascending: false })

  // check which requests this tutor already sent offers to
  const { data: myOffers } = await supabase
    .from('offers')
    .select('request_id')
    .eq('tutor_id', user.id)

  const offeredRequestIds = new Set((myOffers || []).map((o: any) => o.request_id))

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
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E8F0E7] text-[#315B3B] text-xs font-semibold mb-2">
          <ShieldCheck size={13} className="text-[#315B3B]" />
          SPECS Peer Support Board
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">Browse Student Requests</h1>
        <p className="text-[#6B716B] text-sm mt-1">
          Students looking for academic help — view their schedules and offer peer tutoring support
        </p>
      </div>

      {justOffered && (
        <div className="bg-[#E8F0E7] border border-[#315B3B]/30 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xs">
          <CheckCircle size={18} className="text-[#315B3B] flex-shrink-0" />
          <div>
            <p className="text-[#315B3B] font-semibold text-sm">Offer sent successfully!</p>
            <p className="text-[#315B3B]/80 text-xs">The student will be notified and can accept your support proposal.</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <form className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B716B]" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search requests by topic or keyword (e.g. Calculus, Python, Accounting)..."
          className="w-full bg-white border border-[#E8E5DE] rounded-2xl pl-11 pr-4 py-3 text-[#20251F] text-sm placeholder-[#6B716B]/60 focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all shadow-xs"
        />
        {selectedCategory !== 'All' && (
          <input type="hidden" name="category" value={selectedCategory} />
        )}
      </form>

      {/* Category Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat
          return (
            <Link
              key={cat}
              href={'/dashboard/requests/browse?category=' + cat + (query ? '&q=' + query : '')}
              className={
                isActive
                  ? 'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all bg-[#F26A21] border-[#F26A21] text-white shadow-xs'
                  : 'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all bg-white border-[#E8E5DE] text-[#6B716B] hover:border-[#F26A21]/30 hover:text-[#20251F]'
              }
            >
              {cat}
            </Link>
          )
        })}
      </div>

      {/* Requests Grid */}
      {requests && requests.length > 0 ? (
        <div className="grid gap-4">
          {requests.map((req: any) => {
            const isOwn = req.learner_id === user.id
            const isMulti = req.session_type === 'multi'
            const alreadyOffered = offeredRequestIds.has(req.id)
            const timeRange = req.daily_start_time
              ? formatEndTime(req.daily_start_time, req.hours_per_day)
              : null

            return (
              <div
                key={req.id}
                className="bg-white border border-[#E8E5DE] rounded-2xl p-6 shadow-xs hover:border-[#F26A21]/40 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center text-sm font-bold text-[#315B3B] flex-shrink-0">
                      {req.users?.full_name?.[0] ?? '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="font-semibold text-base text-[#20251F] tracking-tight">{req.title}</h2>
                        {isOwn && (
                          <span className="text-[11px] font-semibold text-[#F26A21] border border-[#F26A21]/20 bg-[#FFF0E5] px-2.5 py-0.5 rounded-full">
                            Your request
                          </span>
                        )}
                        {alreadyOffered && !isOwn && (
                          <span className="text-[11px] font-semibold text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={11} />
                            Offer sent
                          </span>
                        )}
                      </div>

                      {req.description && (
                        <p className="text-xs text-[#6B716B] mb-3 leading-relaxed line-clamp-2">
                          {req.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className="text-xs text-[#20251F] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-1 rounded-lg font-medium">
                          {req.category}
                        </span>
                        <span className="text-xs text-[#20251F] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-1 rounded-lg capitalize font-medium">
                          {req.mode}
                        </span>
                        <span className="text-xs text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-2.5 py-1 rounded-lg font-semibold">
                          Free Peer Session
                        </span>
                      </div>

                      {req.start_date && (
                        <div className="bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3 mb-3 space-y-1.5">
                          <p className="text-[10px] text-[#6B716B] uppercase font-bold tracking-wider mb-1">Requested schedule</p>
                          <div className="flex items-center gap-2 text-xs text-[#20251F] font-medium">
                            <Calendar size={13} className="text-[#315B3B] flex-shrink-0" />
                            {isMulti
                              ? formatDate(req.start_date) + ' → ' + formatDate(req.end_date)
                              : formatDate(req.start_date)}
                            {isMulti && (
                              <span className="text-[#F26A21] border border-[#F26A21]/20 bg-[#FFF0E5] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                {req.total_days} day{req.total_days !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {timeRange && (
                            <div className="flex items-center gap-2 text-xs text-[#6B716B]">
                              <Clock size={13} className="text-[#F26A21] flex-shrink-0" />
                              {timeRange} · {req.hours_per_day} hr/day
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-[#6B716B] pt-2 border-t border-[#E8E5DE]/60">
                        <GraduationCap size={13} className="text-[#315B3B]" />
                        <span>Posted by <strong className="text-[#20251F] font-medium">{req.users?.full_name}</strong></span>
                        {req.users?.course && <span>· {req.users.course}</span>}
                        {req.users?.school && <span>· {req.users.school}</span>}
                        <span className="text-[#6B716B]/60">· {timeAgo(req.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8E5DE]">
                    <span className="text-xs text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-3 py-1 rounded-full font-semibold">
                      Open for Help
                    </span>
                    {!isOwn && !alreadyOffered && (
                      <Link
                        href={'/dashboard/requests/' + req.id + '/offer'}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#F26A21] hover:bg-[#D95416] text-white rounded-xl text-xs font-semibold transition-all shadow-xs whitespace-nowrap"
                      >
                        Offer help
                      </Link>
                    )}
                    {!isOwn && alreadyOffered && (
                      <span className="text-xs text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5">
                        <CheckCircle size={12} />
                        Offer sent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-[#F26A21] mx-auto mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-base font-semibold text-[#20251F]">No open requests found</h3>
          <p className="text-[#6B716B] text-sm mt-1">Try selecting a different category or adjusting your search term.</p>
        </div>
      )}
    </div>
  )
}
