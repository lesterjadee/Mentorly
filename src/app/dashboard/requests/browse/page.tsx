import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookOpen, Search, Calendar, Clock, CheckCircle } from 'lucide-react'
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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Browse Requests</h1>
        <p className="text-white/40 text-sm">Students looking for help — view their schedule and send an offer</p>
      </div>

      {justOffered && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          <CheckCircle size={15} className="text-green-400" />
          <p className="text-green-400 text-sm">Offer sent! The learner will review it and respond.</p>
        </div>
      )}

      <form className="relative mb-6">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search requests..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
        />
        {selectedCategory !== 'All' && (
          <input type="hidden" name="category" value={selectedCategory} />
        )}
      </form>

      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={'/dashboard/requests/browse?category=' + cat + (query ? '&q=' + query : '')}
            className={
              selectedCategory === cat
                ? 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-[#26619C] border-[#26619C] text-white'
                : 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
            }
          >
            {cat}
          </Link>
        ))}
      </div>

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
                className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-[#26619C]/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm font-medium text-purple-400 flex-shrink-0">
                      {req.users?.full_name?.[0] ?? '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-medium text-sm">{req.title}</h3>
                        {isOwn && (
                          <span className="text-[10px] text-purple-400 border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 rounded-full">
                            Your request
                          </span>
                        )}
                        {alreadyOffered && !isOwn && (
                          <span className="text-[10px] text-green-400 border border-green-500/20 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={9} />
                            Offer sent
                          </span>
                        )}
                      </div>

                      {req.description && (
                        <p className="text-xs text-white/30 mb-3 leading-relaxed line-clamp-2">
                          {req.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg">{req.category}</span>
                        <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg capitalize">{req.mode}</span>
                        {req.budget && (
                          <span className="text-xs text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-1 rounded-lg">
                            Budget: ₱{req.budget}/hr
                          </span>
                        )}
                      </div>

                      {req.start_date && (
                        <div className="bg-white/3 border border-white/8 rounded-xl p-3 mb-3 space-y-1.5">
                          <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1">Requested schedule</p>
                          <div className="flex items-center gap-2 text-xs text-white/50">
                            <Calendar size={11} className="text-white/30 flex-shrink-0" />
                            {isMulti
                              ? formatDate(req.start_date) + ' → ' + formatDate(req.end_date)
                              : formatDate(req.start_date)}
                            {isMulti && (
                              <span className="text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-0.5 rounded-full text-[10px]">
                                {req.total_days} day{req.total_days !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {timeRange && (
                            <div className="flex items-center gap-2 text-xs text-white/50">
                              <Clock size={11} className="text-white/30 flex-shrink-0" />
                              {timeRange} · {req.hours_per_day}hr/day
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-white/20">
                        Posted by <span className="text-white/40">{req.users?.full_name}</span>
                        {req.users?.school && <span> · {req.users.school}</span>}
                        <span> · {timeAgo(req.created_at)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                    <span className="text-xs text-green-400 border border-green-500/20 bg-green-500/10 px-2 py-1 rounded-full">
                      Open
                    </span>
                    {!isOwn && !alreadyOffered && (
                      <Link
                        href={'/dashboard/requests/' + req.id + '/offer'}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#26619C]/10 hover:bg-[#26619C]/20 border border-[#26619C]/20 hover:border-[#26619C]/40 text-[#4a8fd4] rounded-xl text-xs font-medium transition-all whitespace-nowrap"
                      >
                        Send offer
                      </Link>
                    )}
                    {!isOwn && alreadyOffered && (
                      <span className="text-xs text-white/20 border border-white/8 px-3 py-2 rounded-xl">
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
        <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
          <BookOpen size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No open requests found</p>
          <p className="text-white/20 text-xs mt-1">Try a different category or search term</p>
        </div>
      )}
    </div>
  )
}