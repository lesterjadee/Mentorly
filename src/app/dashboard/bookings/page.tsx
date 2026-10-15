import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, BookOpen } from 'lucide-react'
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
      services(title),
      tutor:users!bookings_tutor_id_fkey(id, full_name, school)
    `)
    .eq('learner_id', user.id)
    .order('created_at', { ascending: false })

  // fetch bookings as tutor
  const { data: asTutor } = await supabase
    .from('bookings')
    .select(`
      *,
      services(title),
      learner:users!bookings_learner_id_fkey(id, full_name, school)
    `)
    .eq('tutor_id', user.id)
    .order('created_at', { ascending: false })

  // helper — get display title from booking
  function getTitle(booking: any) {
    return booking.services?.title || booking.booking_title || 'Tutoring session'
  }

  function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
      pending: 'border-amber-200 text-amber-700 bg-amber-50',
      accepted: 'border-[#315B3B]/25 text-[#315B3B] bg-[#E8F0E7]',
      declined: 'border-red-200 text-red-600 bg-red-50',
      completed: 'border-[#315B3B]/25 text-[#315B3B] bg-[#E8F0E7]',
      cancelled: 'border-[#E8E5DE] text-[#6B716B] bg-[#F5F3ED]',
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
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs capitalize ${styles[status] || ''}`}>
        <Icon size={12} />
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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs text-[#6B716B]">
        {startDate && (
          <span className="flex items-center gap-1.5 font-medium text-[#20251F]">
            <Calendar size={13} className="text-[#315B3B]" />
            {isMulti && endDate ? startDate + ' → ' + endDate : startDate}
          </span>
        )}
        {timeRange && (
          <span className="flex items-center gap-1.5 font-medium text-[#6B716B]">
            <Clock size={13} className="text-[#F26A21]" />
            {timeRange}
          </span>
        )}
        {isMulti && booking.total_days && (
          <span className="text-[11px] font-bold text-[#D95416] border border-[#F26A21]/20 bg-[#FFF0E5] px-2 py-0.5 rounded-full">
            {booking.total_days} days · {booking.hours_per_day}hr/day
          </span>
        )}
        {!isMulti && booking.hours_per_day && (
          <span className="text-xs text-[#6B716B] font-medium bg-[#F5F3ED] px-2 py-0.5 rounded-md">
            {booking.hours_per_day} hr session
          </span>
        )}
      </div>
    )
  }

  function SourceBadge({ booking }: { booking: any }) {
    if (booking.request_id) {
      return (
        <span className="text-[10px] font-bold text-[#D95416] border border-[#F26A21]/20 bg-[#FFF0E5] px-2 py-0.5 rounded-full">
          From Help Request
        </span>
      )
    }
    return (
      <span className="text-[10px] font-bold text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-2 py-0.5 rounded-full">
        Peer Marketplace
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-lg bg-[#FFF0E5] text-[#F26A21] flex items-center justify-center">
            <Calendar size={14} />
          </span>
          <span className="text-xs font-bold text-[#D95416] uppercase tracking-wider">Bookings Hub</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#20251F]">Scheduled Sessions</h1>
        <p className="text-xs text-[#6B716B] mt-0.5">Manage your upcoming learning and tutoring appointments</p>
      </div>

      {params.success && (
        <div className="bg-[#E8F0E7] border border-[#315B3B]/25 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
          <CheckCircle size={18} className="text-[#315B3B] flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#315B3B]">Booking Request Sent!</p>
            <p className="text-xs text-[#24452D] mt-0.5">Your tutor has been notified and will confirm shortly.</p>
          </div>
        </div>
      )}

      {/* Sessions I Booked (Learner) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#939A92] uppercase tracking-wider">
            Sessions I Booked
          </h2>
          <span className="text-xs font-semibold text-[#6B716B]">
            {asLearner?.length || 0} session{asLearner?.length !== 1 ? 's' : ''}
          </span>
        </div>

        {asLearner && asLearner.length > 0 ? (
          <div className="space-y-3">
            {asLearner.map((booking: any) => (
              <div
                key={booking.id}
                className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#F26A21]/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-base text-[#20251F]">{getTitle(booking)}</p>
                      <SourceBadge booking={booking} />
                    </div>
                    <p className="text-xs font-medium text-[#6B716B]">
                      Tutor: <span className="text-[#20251F] font-semibold">{booking.tutor?.full_name}</span> · {booking.tutor?.school}
                    </p>
                    <SessionInfo booking={booking} />
                    {booking.status === 'accepted' && (
                      <div className="mt-3.5">
                        <Link
                          href={'/dashboard/messages/' + booking.tutor_id}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#20251F] hover:text-[#F26A21] bg-[#F5F3ED] hover:bg-[#E8E5DE] border border-[#E8E5DE] px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
                        >
                          <MessageSquare size={13} className="text-[#F26A21]" />
                          Message Tutor
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-8 text-center shadow-xs">
            <Calendar size={24} className="text-[#939A92] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#20251F]">No booked sessions yet</p>
            <p className="text-xs text-[#6B716B] mt-1 max-w-sm mx-auto mb-4">
              Explore the sessions directory or post a help request to get matched with a peer tutor.
            </p>
            <Link
              href="/dashboard/sessions"
              className="inline-flex items-center gap-1.5 bg-[#F26A21] hover:bg-[#D95416] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all"
            >
              Browse Available Sessions
            </Link>
          </div>
        )}
      </div>

      {/* Sessions I'm Tutoring (Tutor) */}
      {asTutor && asTutor.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#315B3B] uppercase tracking-wider">
              Sessions I am Tutoring ⚡
            </h2>
            <span className="text-xs font-semibold text-[#6B716B]">
              {asTutor.length} active session{asTutor.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {asTutor.map((booking: any) => (
              <div
                key={booking.id}
                className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#315B3B]/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-base text-[#20251F]">{getTitle(booking)}</p>
                      <SourceBadge booking={booking} />
                    </div>
                    <p className="text-xs font-medium text-[#6B716B]">
                      Student: <span className="text-[#20251F] font-semibold">{booking.learner?.full_name}</span> · {booking.learner?.school}
                    </p>
                    <SessionInfo booking={booking} />
                    {booking.notes && (
                      <p className="text-xs text-[#6B716B] mt-2.5 p-2.5 bg-[#FFFCF7] rounded-xl border border-[#E8E5DE] italic">
                        "{booking.notes}"
                      </p>
                    )}
                    {booking.status === 'accepted' && (
                      <div className="mt-3.5">
                        <Link
                          href={'/dashboard/messages/' + booking.learner_id}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#20251F] hover:text-[#315B3B] bg-[#F5F3ED] hover:bg-[#E8E5DE] border border-[#E8E5DE] px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
                        >
                          <MessageSquare size={13} className="text-[#315B3B]" />
                          Message Student
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                    <StatusBadge status={booking.status} />
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
    </div>
  )
}
