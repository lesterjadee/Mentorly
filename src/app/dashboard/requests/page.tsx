import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, BookOpen, Search, Calendar, Clock, ChevronRight } from 'lucide-react'

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .eq('learner_id', user.id)
    .order('created_at', { ascending: false })

  // get offer counts per request
  const requestIds = (requests || []).map((r: any) => r.id)
  const { data: offerCounts } = requestIds.length > 0
    ? await supabase
        .from('offers')
        .select('request_id, status')
        .in('request_id', requestIds)
    : { data: [] }

  function getOfferCount(requestId: string) {
    return (offerCounts || []).filter((o: any) => o.request_id === requestId && o.status === 'pending').length
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Requests</h1>
          <p className="text-white/40 text-sm mt-1">Help requests you've posted</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/requests/browse"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white"
          >
            <Search size={15} />
            Browse requests
          </Link>
          <Link
            href="/dashboard/requests/new"
            className="flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] transition-colors px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            <Plus size={16} />
            New request
          </Link>
        </div>
      </div>

      {requests && requests.length > 0 ? (
        <div className="grid gap-4">
          {requests.map((req: any) => {
            const isMulti = req.session_type === 'multi'
            const timeRange = req.daily_start_time
              ? formatEndTime(req.daily_start_time, req.hours_per_day)
              : null
            const pendingOffers = getOfferCount(req.id)

            return (
              <div key={req.id} className="bg-white/3 border border-white/8 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={16} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{req.title}</p>
                      {req.description && (
                        <p className="text-xs text-white/30 mt-1 leading-relaxed line-clamp-2">{req.description}</p>
                      )}

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg">{req.category}</span>
                        <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg capitalize">{req.mode}</span>
                        {req.budget && (
                          <span className="text-xs text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-1 rounded-lg">
                            Budget: ₱{req.budget}/hr
                          </span>
                        )}
                      </div>

                      {req.start_date && (
                        <div className="flex flex-wrap gap-3 mt-3">
                          <span className="flex items-center gap-1.5 text-xs text-white/30">
                            <Calendar size={11} />
                            {isMulti
                              ? formatDate(req.start_date) + ' → ' + formatDate(req.end_date)
                              : formatDate(req.start_date)}
                          </span>
                          {timeRange && (
                            <span className="flex items-center gap-1.5 text-xs text-white/30">
                              <Clock size={11} />
                              {timeRange} · {req.hours_per_day}hr/day
                            </span>
                          )}
                          {isMulti && (
                            <span className="text-xs text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-0.5 rounded-full">
                              {req.total_days} day{req.total_days !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={
                      'text-xs px-2 py-1 rounded-full border ' +
                      (req.status === 'open'
                        ? 'border-green-500/20 text-green-400 bg-green-500/10'
                        : 'border-white/10 text-white/30')
                    }>
                      {req.status}
                    </span>

                    <Link
                      href={'/dashboard/requests/' + req.id + '/offers'}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl text-xs font-medium transition-all"
                    >
                      {pendingOffers > 0 && (
                        <span className="w-4 h-4 bg-[#26619C] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                          {pendingOffers}
                        </span>
                      )}
                      View offers
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
          <BookOpen size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm mb-4">You haven't posted any requests yet</p>
          <Link href="/dashboard/requests/new" className="text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors">
            Post your first request
          </Link>
        </div>
      )}
    </div>
  )
}