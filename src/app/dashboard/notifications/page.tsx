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
    (unreadMessages && unreadMessages.length > 0)
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E7] text-[#315B3B] text-xs font-semibold mb-1">
          <Bell size={12} />
          Activity Center
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">Notifications</h1>
        <p className="text-[#6B716B] text-sm mt-0.5">Stay updated on your tutoring sessions, incoming offers, and messages</p>
      </div>

      {!hasNotifications && (
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-[#F26A21] mx-auto mb-4">
            <Bell size={24} />
          </div>
          <h2 className="text-base font-semibold text-[#20251F]">You're all caught up!</h2>
          <p className="text-sm text-[#6B716B] mt-1">No new notifications or pending requests right now.</p>
        </div>
      )}

      <div className="space-y-3">
        {/* incoming tutor offers (for learners) */}
        {incomingOffers && incomingOffers.map((o: any) => (
          <Link
            key={'offer-' + o.id}
            href={'/dashboard/requests/' + o.request_id + '/offers'}
            className="flex items-start gap-4 bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 hover:border-[#F26A21]/40 hover:shadow-md transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center flex-shrink-0 text-[#F26A21]">
              <Star size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-[#20251F] group-hover:text-[#F26A21] transition-colors">
                New tutor offer received
              </h2>
              <p className="text-xs text-[#6B716B] mt-0.5">
                <span className="font-medium text-[#20251F]">{o.tutor?.full_name}</span> offered help for{' '}
                <span className="font-medium text-[#20251F]">"{o.requests?.title}"</span>
              </p>
              <p className="text-[11px] text-[#6B716B]/70 mt-1">{timeAgo(o.created_at)}</p>
            </div>
            <span className="text-xs font-semibold text-[#F26A21] border border-[#F26A21]/20 bg-[#FFF0E5] px-2.5 py-1 rounded-full flex-shrink-0">
              Offer
            </span>
          </Link>
        ))}

        {/* pending booking requests (for tutors) */}
        {pendingBookings && pendingBookings.map((b: any) => (
          <Link
            key={'pending-' + b.id}
            href="/dashboard/bookings"
            className="flex items-start gap-4 bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 hover:border-[#F26A21]/40 hover:shadow-md transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF8F1] border border-[#F26A21]/20 flex items-center justify-center flex-shrink-0 text-[#F26A21]">
              <Clock size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-[#20251F] group-hover:text-[#F26A21] transition-colors">
                New booking request
              </h2>
              <p className="text-xs text-[#6B716B] mt-0.5">
                <span className="font-medium text-[#20251F]">{b.learner?.full_name}</span> requested to book{' '}
                <span className="font-medium text-[#20251F]">"{b.services?.title}"</span>
              </p>
              <p className="text-[11px] text-[#6B716B]/70 mt-1">{timeAgo(b.created_at)}</p>
            </div>
            <span className="text-xs font-semibold text-[#D95416] border border-[#D95416]/20 bg-[#FFF8F1] px-2.5 py-1 rounded-full flex-shrink-0">
              Pending
            </span>
          </Link>
        ))}

        {/* accepted bookings (for learners) */}
        {acceptedBookings && acceptedBookings.map((b: any) => (
          <Link
            key={'accepted-' + b.id}
            href="/dashboard/bookings"
            className="flex items-start gap-4 bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 hover:border-[#315B3B]/40 hover:shadow-md transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center flex-shrink-0 text-[#315B3B]">
              <CheckCircle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-[#20251F] group-hover:text-[#315B3B] transition-colors">
                Session confirmed!
              </h2>
              <p className="text-xs text-[#6B716B] mt-0.5">
                <span className="font-medium text-[#20251F]">{b.tutor?.full_name}</span> confirmed your session for{' '}
                <span className="font-medium text-[#20251F]">"{b.services?.title}"</span>
              </p>
              <p className="text-[11px] text-[#6B716B]/70 mt-1">{timeAgo(b.created_at)}</p>
            </div>
            <span className="text-xs font-semibold text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-2.5 py-1 rounded-full flex-shrink-0">
              Confirmed
            </span>
          </Link>
        ))}

        {/* declined bookings (for learners) */}
        {declinedBookings && declinedBookings.map((b: any) => (
          <Link
            key={'declined-' + b.id}
            href="/dashboard/bookings"
            className="flex items-start gap-4 bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 hover:border-[#E8E5DE] hover:shadow-md transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F5F3ED] border border-[#E8E5DE] flex items-center justify-center flex-shrink-0 text-[#6B716B]">
              <XCircle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-[#20251F]">
                Booking declined
              </h2>
              <p className="text-xs text-[#6B716B] mt-0.5">
                <span className="font-medium text-[#20251F]">{b.tutor?.full_name}</span> was unable to accept your booking for{' '}
                <span className="font-medium text-[#20251F]">"{b.services?.title}"</span>
              </p>
              <p className="text-[11px] text-[#6B716B]/70 mt-1">{timeAgo(b.created_at)}</p>
            </div>
            <span className="text-xs font-semibold text-[#6B716B] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-1 rounded-full flex-shrink-0">
              Declined
            </span>
          </Link>
        ))}

        {/* unread messages */}
        {unreadMessages && unreadMessages.map((m: any) => (
          <Link
            key={'msg-' + m.id}
            href={'/dashboard/messages/' + m.sender_id}
            className="flex items-start gap-4 bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 hover:border-[#F26A21]/40 hover:shadow-md transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center flex-shrink-0 text-[#F26A21]">
              <MessageSquare size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-[#20251F] group-hover:text-[#F26A21] transition-colors">
                New message
              </h2>
              <p className="text-xs text-[#6B716B] mt-0.5">
                <span className="font-medium text-[#20251F]">{m.sender?.full_name}</span>:{' '}
                {m.content.length > 50 ? m.content.substring(0, 50) + '...' : m.content}
              </p>
              <p className="text-[11px] text-[#6B716B]/70 mt-1">{timeAgo(m.created_at)}</p>
            </div>
            <span className="text-xs font-semibold text-[#F26A21] border border-[#F26A21]/20 bg-[#FFF0E5] px-2.5 py-1 rounded-full flex-shrink-0">
              Message
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
