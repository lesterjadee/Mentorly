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
  type: 'offer' | 'booking_pending' | 'booking_accepted' | 'booking_declined' | 'booking_completed' | 'message' | 'trade_request'
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
      .select('id, created_at, request_id, tutor:users!offers_tutor_id_fkey(full_name), requests(title)')
      .eq('learner_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    offers?.forEach((o: any) => {
      allNotifs.push({
        id: 'offer-' + o.id,
        type: 'offer',
        title: 'New Tutor Offer',
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
        title: 'New Booking Request',
        desc: (b.learner?.full_name || 'A student') + ' wants to book "' + (b.services?.title || 'a session') + '"',
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
        title: 'Booking Confirmed!',
        desc: (b.tutor?.full_name || 'Your tutor') + ' accepted your tutoring session',
        href: '/dashboard/bookings',
        time: b.created_at,
        read: false,
      })
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
        title: 'Message from ' + (m.sender?.full_name || 'User'),
        desc: m.content.length > 60 ? m.content.substring(0, 60) + '...' : m.content,
        href: '/dashboard/messages/' + m.sender?.id,
        time: m.created_at,
        read: false,
      })
    })

    allNotifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    setNotifs(allNotifs)
    setUnread(allNotifs.length)
    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()

    const supabase = createClient()
    const channel = supabase
      .channel(uniqueRealtimeTopic('notifications-panel', userId))
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: 'receiver_id=eq.' + userId },
        () => loadNotifications()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings', filter: 'tutor_id=eq.' + userId },
        () => loadNotifications()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  function NotifIcon({ type }: { type: Notif['type'] }) {
    const configs: Record<string, { icon: any; bg: string; color: string }> = {
      offer: { icon: Star, bg: 'bg-[#FFF0E5] border border-[#F26A21]/20', color: 'text-[#F26A21]' },
      booking_pending: { icon: Clock, bg: 'bg-amber-50 border border-amber-200', color: 'text-amber-600' },
      booking_accepted: { icon: CheckCircle, bg: 'bg-[#E8F0E7] border border-[#315B3B]/20', color: 'text-[#315B3B]' },
      booking_declined: { icon: XCircle, bg: 'bg-red-50 border border-red-200', color: 'text-red-500' },
      booking_completed: { icon: CheckCircle, bg: 'bg-[#E8F0E7] border border-[#315B3B]/20', color: 'text-[#315B3B]' },
      message: { icon: MessageSquare, bg: 'bg-[#FFF0E5] border border-[#F26A21]/20', color: 'text-[#F26A21]' },
      trade_request: { icon: ArrowLeftRight, bg: 'bg-[#E8F0E7] border border-[#315B3B]/20', color: 'text-[#315B3B]' },
    }
    const cfg = configs[type] || configs.offer
    return (
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <cfg.icon size={15} className={cfg.color} />
      </div>
    )
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen(!open)
          if (!open) loadNotifications()
        }}
        className="relative w-9 h-9 flex items-center justify-center text-[#6B716B] hover:text-[#20251F] hover:bg-[#F5F3ED] rounded-xl transition-all duration-150 border border-[#E8E5DE] shadow-xs"
        title="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F26A21] rounded-full text-[9px] font-extrabold text-white flex items-center justify-center border-2 border-white shadow-xs">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-11 w-84 sm:w-96 bg-white border border-[#E8E5DE] rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E5DE] bg-[#FFFCF7]">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-[#20251F]">Notifications</p>
              {unread > 0 && (
                <span className="bg-[#FFF0E5] text-[#D95416] border border-[#F26A21]/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-[#F26A21] hover:text-[#D95416] transition-colors"
              >
                View all
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-lg hover:bg-[#F5F3ED] flex items-center justify-center text-[#939A92] hover:text-[#20251F] transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E5DE]">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-[#F26A21] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-[#E8F0E7] text-[#315B3B] flex items-center justify-center mx-auto mb-2">
                  <CheckCircle size={18} />
                </div>
                <p className="text-sm font-semibold text-[#20251F]">All caught up!</p>
                <p className="text-xs text-[#6B716B] mt-0.5">No pending notifications at this time</p>
              </div>
            ) : (
              <div>
                {notifs.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#FFFCF7] transition-colors group"
                  >
                    <NotifIcon type={notif.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#20251F] group-hover:text-[#F26A21] transition-colors truncate">
                        {notif.title}
                      </p>
                      <p className="text-xs text-[#6B716B] mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.desc}
                      </p>
                      <p className="text-[10px] text-[#939A92] font-medium mt-1">{timeAgo(notif.time)}</p>
                    </div>
                    <ChevronRight size={13} className="text-[#939A92] group-hover:text-[#F26A21] flex-shrink-0 mt-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
