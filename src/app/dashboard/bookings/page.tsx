import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react'
import AcceptDeclineButtons from './AcceptDeclineButtons'
import Link from 'next/link'

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams

  // fetch bookings as learner — include both service and request info
  const { data: asLearner } = await supabase
    .from('bookings')
    .select(`
      *,
      services(title, price_per_hour),
      tutor:users!bookings_tutor_id_fkey(id, full_name, school)
    `)
    .eq('learner_id', user.id)
    .order('created_at', { ascending: false })

  // fetch bookings as tutor
  const { data: asTutor } = await supabase
    .from('bookings')
    .select(`
      *,
      services(title, price_per_hour),
      learner:users!bookings_learner_id_fkey(id, full_name, school)
    `)
    .eq('tutor_id', user.id)
    .order('created_at', { ascending: false })

  const { data: myReviews } = await supabase
    .from('reviews')
    .select('booking_id')
    .eq('reviewer_id', user.id)

  const reviewedBookingIds = new Set((myReviews || []).map((r: any) => r.booking_id))

  // helper — get display title from booking
  function getTitle(booking: any) {
    return booking.services?.title || booking.booking_title || 'Tutoring session'
  }

  function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
      pending: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/10',
      accepted: 'border-green-500/20 text-green-400 bg-green-500/10',
      declined: 'border-red-500/20 text-red-400 bg-red-500/10',
      completed: 'border-blue-500/20 text-blue-400 bg-blue-500/10',
      cancelled: 'border-white/10 text-white/30',
    }
    const icons: Record<string, any> = {
      pending: AlertCircle,
      accepted: CheckCircle,
      declined: XCircle,
      completed: CheckCircle,
      cancelled: XCircle,
    }
    const Icon = icons[status] || AlertCircle
    return (
      <span className={'text-xs px-2 py-1 rounded-full border flex items-center gap-1 ' + (styles[status] || '')}>
        <Icon size={10} />
        {status}
      </span>
    )
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  function formatEndTime(timeStr: string, hours: number) {
    if (!timeStr || !hours) return '—'
    const [h, m] = timeStr.split(':').map(Number)
    const totalMins = h * 60 + m + hours * 60
    const endH = Math.floor(totalMins / 60) % 24
    const endM = totalMins % 60
    const period = (t: number) => t >= 12 ? 'PM' : 'AM'
    const fmt = (t: number) => t % 12 === 0 ? 12 : t % 12
    return (
      fmt(h) + ':' + String(m).padStart(2, '0') + ' ' + period(h) +
      ' – ' +
      fmt(endH) + ':' + String(endM).padStart(2, '0') + ' ' + period(endH)
    )
  }

  function SessionInfo({ booking }: { booking: any }) {
    const isMulti = booking.session_type === 'multi'
    const startDate = booking.start_date ? formatDate(booking.start_date) : null
    const endDate = booking.end_date ? formatDate(booking.end_date) : null
    const timeRange = booking.daily_start_time
      ? formatEndTime(booking.daily_start_time, booking.hours_per_day)
      : null

    if (!startDate && !timeRange) return null

    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
        {startDate && (
          <span className="flex items-center gap-1 text-xs text-white/30">
            <Calendar size={11} />
            {isMulti && endDate ? startDate + ' → ' + endDate : startDate}
          </span>
        )}
        {timeRange && (
          <span className="flex items-center gap-1 text-xs text-white/30">
            <Clock size={11} />
            {timeRange}
          </span>
        )}
        {isMulti && booking.total_days && (
          <span className="text-xs text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-0.5 rounded-full">
            {booking.total_days} day{booking.total_days !== 1 ? 's' : ''} · {booking.hours_per_day}hr/day
          </span>
        )}
        {!isMulti && booking.hours_per_day && (
          <span className="text-xs text-white/30">{booking.hours_per_day}hr</span>
        )}
      </div>
    )
  }

  // source badge — was this from a marketplace service or a request offer?
  function SourceBadge({ booking }: { booking: any }) {
    if (booking.request_id) {
      return (
        <span className="text-[10px] text-purple-400 border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 rounded-full">
          From request
        </span>
      )
    }
    return (
      <span className="text-[10px] text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-0.5 rounded-full">
        Marketplace
      </span>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-white/40 text-sm mt-1">Your scheduled sessions</p>
      </div>

      {params.success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-400" />
          <p className="text-green-400 text-sm">Booking request sent! Waiting for tutor confirmation.</p>
        </div>
      )}

      {/* as learner */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
          Sessions I booked
        </h2>
        {asLearner && asLearner.length > 0 ? (
          <div className="space-y-3">
            {asLearner.map((booking: any) => (
              <div key={booking.id} className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-sm">{getTitle(booking)}</p>
                      <SourceBadge booking={booking} />
                    </div>
                    <p className="text-xs text-white/30">
                      with {booking.tutor?.full_name} · {booking.tutor?.school}
                    </p>
                    <SessionInfo booking={booking} />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {booking.status === 'accepted' && (
                        <Link
                          href={'/dashboard/messages/' + booking.tutor_id}
                          className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
                        >
                          <MessageSquare size={11} />
                          Message tutor
                        </Link>
                      )}
                      {booking.status === 'completed' && !reviewedBookingIds.has(booking.id) && (
                        <Link
                          href={'/dashboard/reviews/new?booking=' + booking.id + '&tutor=' + booking.tutor_id}
                          className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 rounded-lg"
                        >
                          ⭐ Leave a review
                        </Link>
                      )}
                      {booking.status === 'completed' && reviewedBookingIds.has(booking.id) && (
                        <span className="inline-flex items-center gap-1 text-xs text-white/20 border border-white/10 px-3 py-1.5 rounded-lg">
                          Review submitted
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                    <StatusBadge status={booking.status} />
                    <p className="text-xs font-medium text-[#4a8fd4]">
                      ₱{booking.total_price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
            <p className="text-white/30 text-sm">
              No bookings yet — browse the marketplace or wait for your requests to receive offers
            </p>
          </div>
        )}
      </div>

      {/* as tutor */}
      {asTutor && asTutor.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
            Sessions I'm tutoring
          </h2>
          <div className="space-y-3">
            {asTutor.map((booking: any) => (
              <div key={booking.id} className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-sm">{getTitle(booking)}</p>
                      <SourceBadge booking={booking} />
                    </div>
                    <p className="text-xs text-white/30">
                      {booking.status === 'pending' ? 'requested by' : 'with'} {booking.learner?.full_name} · {booking.learner?.school}
                    </p>
                    <SessionInfo booking={booking} />
                    {booking.notes && (
                      <p className="text-xs text-white/20 mt-2 italic">
                        "{booking.notes}"
                      </p>
                    )}
                    {booking.status === 'accepted' && (
                      <Link
                        href={'/dashboard/messages/' + booking.learner_id}
                        className="inline-flex items-center gap-1 mt-3 text-xs text-white/50 hover:text-white transition-colors border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
                      >
                        <MessageSquare size={11} />
                        Message student
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                    <StatusBadge status={booking.status} />
                    <p className="text-xs font-medium text-[#4a8fd4]">
                      ₱{booking.total_price}
                    </p>
                    <AcceptDeclineButtons
                      bookingId={booking.id}
                      status={booking.status}
                      isLearner={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* empty state if tutor has no bookings */}
      {(!asTutor || asTutor.length === 0) && (!asLearner || asLearner.length === 0) && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
          <p className="text-white/30 text-sm">No bookings yet</p>
        </div>
      )}
    </div>
  )
}