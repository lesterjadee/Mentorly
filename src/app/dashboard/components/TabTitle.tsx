'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  userId: string
}

export default function TabTitle({ userId }: Props) {
  useEffect(() => {
    async function updateTitle() {
      const supabase = createClient()

      const { count: unreadMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false)

      const { count: pendingBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', userId)
        .eq('status', 'pending')

      const { count: pendingOffers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('learner_id', userId)
        .eq('status', 'pending')

      const total = (unreadMessages || 0) + (pendingBookings || 0) + (pendingOffers || 0)

      if (total > 0) {
        document.title = '(' + total + ') Mentorly'
      } else {
        document.title = 'Mentorly'
      }
    }

    updateTitle()

    // realtime updates
    const supabase = createClient()
    const channel = supabase
      .channel('tab-title-' + userId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, updateTitle)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, updateTitle)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, updateTitle)
      .subscribe()

    // update every 30 seconds
    const interval = setInterval(updateTitle, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
      document.title = 'Mentorly'
    }
  }, [userId])

  return null
}