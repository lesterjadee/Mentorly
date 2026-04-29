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

  const { data: asLearner } = await supabase
    .from('bookings')
    .select('*, services(title, price_per_hour), tutor:users!bookings_tutor_id_fkey(full_name, school)')
    .eq('learner_id', user.id)
    .order('scheduled_at', { ascending: true })

  const { data: asTutor } = await supabase
    .from('bookings')
    .select('*, services(title, price_per_hour), learner:users!bookings_learner_id_fkey(full_name, school)')
    .eq('tutor_id', user.id)
    .order('scheduled_at', { ascending: true })

  const { data: myReviews } = await supabase
    .from('reviews')
    .select('booking_id')
    .eq('reviewer_id', user.id)

  const reviewedBookingIds = new Set((myReviews || []).map((r: any) => r.booking_id))

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
    return new Date(dateStr).toLocaleDateString('en-PH', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-PH', {
      hour: '2-digit', minute: '2-digit'
    })
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
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Sessions I booked</h2>
        {asLearner && asLearner.length > 0 ? (
          <div className="space-y-3">
            {asLearner.map((booking: any) => (
              <div key={booking.id} className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{booking.services?.title}</p>
                    <p className="text-xs text-white/30 mt-0.5">with {booking.tutor?.full_name}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        <Calendar size={11} />
                        {formatDate(booking.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        <Clock size={11} />
                        {formatTime(booking.scheduled_at)} · {booking.duration_hours}hr
                      </span>
                    </div>
                    {booking.status === 'accepted' && (
                      <Link
                        href={'/dashboard/messages/' + booking.tutor_id}
                        className="inline-flex items-center gap-1 mt-3 text-xs text-white/50 hover:text-white transition-colors border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
                      >
                        <MessageSquare size={11} />
                        Message tutor
                      </Link>
                    )}
                    {booking.status === 'completed' && !reviewedBookingIds.has(booking.id) && (
                      <Link
                        href={'/dashboard/reviews/new?booking=' + booking.id + '&tutor=' + booking.tutor_id}
                        className="inline-flex items-center gap-1 mt-3 text-xs text-yellow-400 hover:text-yellow-300 transition-colors border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 rounded-lg"
                      >
                        ⭐ Leave a review
                      </Link>
                    )}
                    {booking.status === 'completed' && reviewedBookingIds.has(booking.id) && (
                      <span className="inline-flex items-center gap-1 mt-3 text-xs text-white/20 border border-white/10 px-3 py-1.5 rounded-lg">
                        Review submitted
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={booking.status} />
                    <p className="text-xs font-medium text-[#4a8fd4]">₱{booking.total_price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
            <p className="text-white/30 text-sm">No bookings yet — browse the marketplace to book a session</p>
          </div>
        )}
      </div>

      {/* as tutor */}
      {asTutor && asTutor.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Requests from students</h2>
          <div className="space-y-3">
            {asTutor.map((booking: any) => (
              <div key={booking.id} className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{booking.services?.title}</p>
                    <p className="text-xs text-white/30 mt-0.5">from {booking.learner?.full_name}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        <Calendar size={11} />
                        {formatDate(booking.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        <Clock size={11} />
                        {formatTime(booking.scheduled_at)} · {booking.duration_hours}hr
                      </span>
                    </div>
                    {booking.notes && (
                      <p className="text-xs text-white/20 mt-2 italic">"{booking.notes}"</p>
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
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={booking.status} />
                    <p className="text-xs font-medium text-[#4a8fd4]">₱{booking.total_price}</p>
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