import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, Star, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pendingBookings } = await supabase
    .from('bookings')
    .select('*, services(title), learner:users!bookings_learner_id_fkey(full_name)')
    .eq('tutor_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const { data: acceptedBookings } = await supabase
    .from('bookings')
    .select('*, services(title), tutor:users!bookings_tutor_id_fkey(full_name)')
    .eq('learner_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: declinedBookings } = await supabase
    .from('bookings')
    .select('*, services(title), tutor:users!bookings_tutor_id_fkey(full_name)')
    .eq('learner_id', user.id)
    .eq('status', 'declined')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: completedBookings } = await supabase
    .from('bookings')
    .select('*, services(title), tutor:users!bookings_tutor_id_fkey(full_name)')
    .eq('learner_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: myReviews } = await supabase
    .from('reviews')
    .select('booking_id')
    .eq('reviewer_id', user.id)

  const reviewedIds = new Set((myReviews || []).map((r: any) => r.booking_id))

  const { data: unreadMessages } = await supabase
    .from('messages')
    .select('*, sender:users!messages_sender_id_fkey(full_name)')
    .eq('receiver_id', user.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: incomingOffers } = await supabase
    .from('offers')
    .select('*, tutor:users!offers_tutor_id_fkey(full_name), requests(title)')
    .eq('learner_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

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

  const hasNotifications = (
    (pendingBookings && pendingBookings.length > 0) ||
    (acceptedBookings && acceptedBookings.length > 0) ||
    (declinedBookings && declinedBookings.length > 0) ||
    (incomingOffers && incomingOffers.length > 0) ||
    (unreadMessages && unreadMessages.length > 0) ||
    (completedBookings && completedBookings.some((b: any) => !reviewedIds.has(b.id)))
  )

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-white/40 text-sm mt-1">Stay updated on your sessions and messages</p>
      </div>

      {!hasNotifications && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
          <Bell size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm">You're all caught up!</p>
          <p className="text-white/20 text-xs mt-1">No new notifications right now</p>
        </div>
      )}

      <div className="space-y-3">

        {/* incoming tutor offers (for learners) */}
        {incomingOffers && incomingOffers.map((o: any) => (
          <Link
            key={'offer-' + o.id}
            href={'/dashboard/requests/' + o.request_id + '/offers'}
            className="flex items-start gap-4 bg-white/3 border border-[#26619C]/20 rounded-2xl p-4 hover:border-[#26619C]/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center flex-shrink-0">
              <Star size={15} className="text-[#4a8fd4]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">New tutor offer</p>
              <p className="text-xs text-white/40 mt-0.5">
                <span className="text-white/60">{o.tutor?.full_name}</span> sent an offer for{' '}
                <span className="text-white/60">{o.requests?.title}</span>
              </p>
              <p className="text-xs text-white/20 mt-1">{timeAgo(o.created_at)}</p>
            </div>
            <span className="text-xs text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-1 rounded-full flex-shrink-0">
              Offer
            </span>
          </Link>
        ))}

        {/* pending booking requests (for tutors) */}
        {pendingBookings && pendingBookings.map((b: any) => (
          <Link
            key={'pending-' + b.id}
            href="/dashboard/bookings"
            className="flex items-start gap-4 bg-white/3 border border-yellow-500/20 rounded-2xl p-4 hover:border-yellow-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Clock size={15} className="text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">New booking request</p>
              <p className="text-xs text-white/40 mt-0.5">
                <span className="text-white/60">{b.learner?.full_name}</span> wants to book{' '}
                <span className="text-white/60">{b.services?.title}</span>
              </p>
              <p className="text-xs text-white/20 mt-1">{timeAgo(b.created_at)}</p>
            </div>
            <span className="text-xs text-yellow-400 border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 rounded-full flex-shrink-0">
              Pending
            </span>
          </Link>
        ))}

        {/* accepted bookings (for learners) */}
        {acceptedBookings && acceptedBookings.map((b: any) => (
          <Link
            key={'accepted-' + b.id}
            href="/dashboard/bookings"
            className="flex items-start gap-4 bg-white/3 border border-green-500/20 rounded-2xl p-4 hover:border-green-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={15} className="text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Booking accepted</p>
              <p className="text-xs text-white/40 mt-0.5">
                <span className="text-white/60">{b.tutor?.full_name}</span> accepted your booking for{' '}
                <span className="text-white/60">{b.services?.title}</span>
              </p>
              <p className="text-xs text-white/20 mt-1">{timeAgo(b.created_at)}</p>
            </div>
            <span className="text-xs text-green-400 border border-green-500/20 bg-green-500/10 px-2 py-1 rounded-full flex-shrink-0">
              Accepted
            </span>
          </Link>
        ))}

        {/* declined bookings (for learners) */}
        {declinedBookings && declinedBookings.map((b: any) => (
          <Link
            key={'declined-' + b.id}
            href="/dashboard/bookings"
            className="flex items-start gap-4 bg-white/3 border border-red-500/20 rounded-2xl p-4 hover:border-red-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
              <XCircle size={15} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Booking declined</p>
              <p className="text-xs text-white/40 mt-0.5">
                <span className="text-white/60">{b.tutor?.full_name}</span> declined your booking for{' '}
                <span className="text-white/60">{b.services?.title}</span>
              </p>
              <p className="text-xs text-white/20 mt-1">{timeAgo(b.created_at)}</p>
            </div>
            <span className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 px-2 py-1 rounded-full flex-shrink-0">
              Declined
            </span>
          </Link>
        ))}

        {/* completed — leave review */}
        {completedBookings && completedBookings
          .filter((b: any) => !reviewedIds.has(b.id))
          .map((b: any) => (
            <Link
              key={'review-' + b.id}
              href={'/dashboard/reviews/new?booking=' + b.id + '&tutor=' + b.tutor_id}
              className="flex items-start gap-4 bg-white/3 border border-yellow-500/20 rounded-2xl p-4 hover:border-yellow-500/40 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Star size={15} className="text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Rate your session</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Your session for{' '}
                  <span className="text-white/60">{b.services?.title}</span> is complete — leave a review!
                </p>
                <p className="text-xs text-white/20 mt-1">{timeAgo(b.created_at)}</p>
              </div>
              <span className="text-xs text-yellow-400 border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 rounded-full flex-shrink-0">
                Review
              </span>
            </Link>
          ))}

        {/* unread messages */}
        {unreadMessages && unreadMessages.map((m: any) => (
          <Link
            key={'msg-' + m.id}
            href={'/dashboard/messages/' + m.sender_id}
            className="flex items-start gap-4 bg-white/3 border border-[#26619C]/20 rounded-2xl p-4 hover:border-[#26619C]/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={15} className="text-[#4a8fd4]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">New message</p>
              <p className="text-xs text-white/40 mt-0.5">
                <span className="text-white/60">{m.sender?.full_name}</span>:{' '}
                {m.content.length > 50 ? m.content.substring(0, 50) + '...' : m.content}
              </p>
              <p className="text-xs text-white/20 mt-1">{timeAgo(m.created_at)}</p>
            </div>
            <span className="text-xs text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-1 rounded-full flex-shrink-0">
              Message
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}