'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uniqueRealtimeTopic } from '@/lib/supabase/realtime'
import {
  Bell, X, Star, MessageSquare, CheckCircle,
  XCircle, Clock, ArrowLeftRight, ChevronRight
} from 'lucide-react'
import Link from 'next/link'

type Notif = {
  id: string
  type: 'offer' | 'booking_pending' | 'booking_accepted' | 'booking_declined' | 'booking_completed' | 'message' | 'trade_request' | 'review'
  title: string
  desc: string
  href: string
  time: string
  read: boolean
}

type Props = {
  userId: string
}

export default function NotificationPanel({ userId }: Props) {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [unread, setUnread] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  async function loadNotifications() {
    const supabase = createClient()

    const allNotifs: Notif[] = []

    // pending offers for learner
    const { data: offers } = await supabase
      .from('offers')
      .select('id, created_at, tutor:users!offers_tutor_id_fkey(full_name), requests(title)')
      .eq('learner_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    offers?.forEach((o: any) => {
      allNotifs.push({
        id: 'offer-' + o.id,
        type: 'offer',
        title: 'New tutor offer',
        desc: (o.tutor?.full_name || 'A tutor') + ' wants to help with "' + (o.requests?.title || 'your request') + '"',
        href: '/dashboard/requests/' + o.request_id + '/offers',
        time: o.created_at,
        read: false,
      })
    })

    // pending bookings for tutor
    const { data: pendingBookings } = await supabase
      .from('bookings')
      .select('id, created_at, services(title), learner:users!bookings_learner_id_fkey(full_name)')
      .eq('tutor_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    pendingBookings?.forEach((b: any) => {
      allNotifs.push({
        id: 'pending-' + b.id,
        type: 'booking_pending',
        title: 'New booking request',
        desc: (b.learner?.full_name || 'A student') + ' wants to book "' + (b.services?.title || b.booking_title || 'a session') + '"',
        href: '/dashboard/bookings',
        time: b.created_at,
        read: false,
      })
    })

    // accepted bookings for learner
    const { data: acceptedBookings } = await supabase
      .from('bookings')
      .select('id, created_at, services(title), tutor:users!bookings_tutor_id_fkey(full_name)')
      .eq('learner_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .limit(3)

    acceptedBookings?.forEach((b: any) => {
      allNotifs.push({
        id: 'accepted-' + b.id,
        type: 'booking_accepted',
        title: 'Booking confirmed!',
        desc: (b.tutor?.full_name || 'Your tutor') + ' accepted your booking',
        href: '/dashboard/bookings',
        time: b.created_at,
        read: false,
      })
    })

    // completed sessions needing review
    const { data: myReviews } = await supabase
      .from('reviews')
      .select('booking_id')
      .eq('reviewer_id', userId)

    const reviewedIds = new Set((myReviews || []).map((r: any) => r.booking_id))

    const { data: completed } = await supabase
      .from('bookings')
      .select('id, created_at, services(title), tutor:users!bookings_tutor_id_fkey(full_name)')
      .eq('learner_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(3)

    completed?.forEach((b: any) => {
      if (!reviewedIds.has(b.id)) {
        allNotifs.push({
          id: 'review-' + b.id,
          type: 'review',
          title: 'Rate your session',
          desc: 'How was your session with ' + (b.tutor?.full_name || 'your tutor') + '?',
          href: '/dashboard/reviews/new?booking=' + b.id + '&tutor=' + b.tutor_id,
          time: b.created_at,
          read: false,
        })
      }
    })

    // unread messages
    const { data: messages } = await supabase
      .from('messages')
      .select('id, created_at, content, sender:users!messages_sender_id_fkey(full_name, id)')
      .eq('receiver_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5)

    messages?.forEach((m: any) => {
      allNotifs.push({
        id: 'msg-' + m.id,
        type: 'message',
        title: 'New message from ' + (m.sender?.full_name || 'someone'),
        desc: m.content.length > 60 ? m.content.substring(0, 60) + '...' : m.content,
        href: '/dashboard/messages/' + m.sender?.id,
        time: m.created_at,
        read: false,
      })
    })

    // pending trade requests for poster
    const { data: tradeRequests } = await supabase
      .from('trade_requests')
      .select('id, created_at, requester:users!trade_requests_requester_id_fkey(full_name), trades(need_subject, offer_subject)')
      .eq('poster_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(3)

    tradeRequests?.forEach((t: any) => {
      allNotifs.push({
        id: 'trade-' + t.id,
        type: 'trade_request',
        title: 'New swap request',
        desc: (t.requester?.full_name || 'A student') + ' wants to swap ' + (t.trades?.need_subject || '') + ' ↔ ' + (t.trades?.offer_subject || ''),
        href: '/dashboard/trades/' + t.trade_id + '/requests',
        time: t.created_at,
        read: false,
      })
    })

    // sort by time descending
    allNotifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    setNotifs(allNotifs)
    setUnread(allNotifs.length)
    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()

    // realtime subscription for new messages
    const supabase = createClient()
    const channel = supabase
      .channel(uniqueRealtimeTopic('notif-panel', userId))
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: 'receiver_id=eq.' + userId,
      }, () => {
        loadNotifications()
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'offers',
        filter: 'learner_id=eq.' + userId,
      }, () => {
        loadNotifications()
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
      }, () => {
        loadNotifications()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // close on ESC
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

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

  function NotifIcon({ type }: { type: Notif['type'] }) {
    const configs: Record<string, { icon: any; bg: string; color: string }> = {
      offer: { icon: Star, bg: 'bg-[#26619C]/10 border border-[#26619C]/20', color: 'text-[#4a8fd4]' },
      booking_pending: { icon: Clock, bg: 'bg-yellow-500/10 border border-yellow-500/20', color: 'text-yellow-400' },
      booking_accepted: { icon: CheckCircle, bg: 'bg-green-500/10 border border-green-500/20', color: 'text-green-400' },
      booking_declined: { icon: XCircle, bg: 'bg-red-500/10 border border-red-500/20', color: 'text-red-400' },
      booking_completed: { icon: CheckCircle, bg: 'bg-blue-500/10 border border-blue-500/20', color: 'text-blue-400' },
      message: { icon: MessageSquare, bg: 'bg-purple-500/10 border border-purple-500/20', color: 'text-purple-400' },
      trade_request: { icon: ArrowLeftRight, bg: 'bg-teal-500/10 border border-teal-500/20', color: 'text-teal-400' },
      review: { icon: Star, bg: 'bg-yellow-500/10 border border-yellow-500/20', color: 'text-yellow-400' },
    }
    const cfg = configs[type] || configs.offer
    return (
      <div className={'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ' + cfg.bg}>
        <cfg.icon size={15} className={cfg.color} />
      </div>
    )
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) loadNotifications() }}
        className="relative w-9 h-9 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-150"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#26619C] rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-[#080C14] animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* panel */}
      {open && (
        <div className="absolute right-0 top-12 w-96 bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">

          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">Notifications</p>
              {unread > 0 && (
                <span className="bg-[#26619C] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
              >
                View all
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* content */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-[#26619C] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={28} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm font-medium">All caught up!</p>
                <p className="text-white/20 text-xs mt-1">No new notifications</p>
              </div>
            ) : (
              <div>
                {notifs.map((notif, i) => (
                  <Link
                    key={notif.id}
                    href={notif.href}
                    onClick={() => setOpen(false)}
                    className={
                      'flex items-start gap-3 px-5 py-4 hover:bg-white/3 transition-colors group ' +
                      (i < notifs.length - 1 ? 'border-b border-white/5' : '')
                    }
                  >
                    <NotifIcon type={notif.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                        {notif.title}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.desc}
                      </p>
                      <p className="text-[10px] text-white/20 mt-1.5">{timeAgo(notif.time)}</p>
                    </div>
                    <ChevronRight size={13} className="text-white/10 group-hover:text-white/30 flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* footer */}
          {notifs.length > 0 && (
            <div className="border-t border-white/8 px-5 py-3">
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="block w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                See all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
