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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E8F0E7] text-[#315B3B] text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#315B3B]" />
            Peer Assistance Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">My Requests</h1>
          <p className="text-[#6B716B] text-sm mt-1">Help requests you've posted on the peer marketplace</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/requests/browse"
            className="flex items-center gap-2 bg-white hover:bg-[#F5F3ED] border border-[#E8E5DE] transition-colors px-4 py-2.5 rounded-xl text-sm font-medium text-[#20251F] shadow-xs"
          >
            <Search size={15} className="text-[#6B716B]" />
            Browse requests
          </Link>
          <Link
            href="/dashboard/requests/new"
            className="flex items-center gap-2 bg-[#F26A21] hover:bg-[#D95416] transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs"
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
              <div
                key={req.id}
                className="bg-white border border-[#E8E5DE] rounded-2xl p-6 shadow-xs hover:border-[#F26A21]/30 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center flex-shrink-0 text-[#F26A21]">
                      <BookOpen size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-base text-[#20251F] tracking-tight">{req.title}</h2>
                      {req.description && (
                        <p className="text-xs text-[#6B716B] mt-1.5 leading-relaxed line-clamp-2">{req.description}</p>
                      )}

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs text-[#20251F] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-1 rounded-lg font-medium">
                          {req.category}
                        </span>
                        <span className="text-xs text-[#20251F] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-1 rounded-lg capitalize font-medium">
                          {req.mode}
                        </span>
                        {isMulti && (
                          <span className="text-xs text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-2.5 py-1 rounded-lg font-semibold">
                            {req.total_days} day{req.total_days !== 1 ? 's' : ''} course
                          </span>
                        )}
                      </div>

                      {req.start_date && (
                        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-[#E8E5DE]/60 text-xs text-[#6B716B]">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#315B3B]" />
                            {isMulti
                              ? formatDate(req.start_date) + ' → ' + formatDate(req.end_date)
                              : formatDate(req.start_date)}
                          </span>
                          {timeRange && (
                            <span className="flex items-center gap-1.5">
                              <Clock size={13} className="text-[#F26A21]" />
                              {timeRange} · {req.hours_per_day} hr/day
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8E5DE]">
                    <span className={
                      'text-xs px-3 py-1 rounded-full font-semibold border ' +
                      (req.status === 'open'
                        ? 'border-[#315B3B]/20 text-[#315B3B] bg-[#E8F0E7]'
                        : 'border-[#E8E5DE] text-[#6B716B] bg-[#F5F3ED]')
                    }>
                      {req.status === 'open' ? 'Active · Open' : 'Closed'}
                    </span>

                    <Link
                      href={'/dashboard/requests/' + req.id + '/offers'}
                      className="flex items-center gap-2 px-3.5 py-2 bg-[#F5F3ED] hover:bg-[#FFF0E5] border border-[#E8E5DE] hover:border-[#F26A21]/30 text-[#20251F] hover:text-[#F26A21] rounded-xl text-xs font-semibold transition-all shadow-xs"
                    >
                      {pendingOffers > 0 && (
                        <span className="w-4 h-4 bg-[#F26A21] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                          {pendingOffers}
                        </span>
                      )}
                      <span>View offers</span>
                      <ChevronRight size={13} />
                    </Link>
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
          <h3 className="text-base font-semibold text-[#20251F]">You haven't posted any requests yet</h3>
          <p className="text-[#6B716B] text-sm max-w-sm mx-auto mt-1 mb-5">
            Need help with a subject, lab report, or coding project? Post a request and verified peer tutors will reach out.
          </p>
          <Link
            href="/dashboard/requests/new"
            className="inline-flex items-center gap-2 bg-[#F26A21] hover:bg-[#D95416] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-xs"
          >
            <Plus size={16} />
            Post your first request
          </Link>
        </div>
      )}
    </div>
  )
}
