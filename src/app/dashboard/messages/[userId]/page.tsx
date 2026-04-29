import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatWindow from './ChatWindow'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { userId } = await params

  // get the other user's profile
  const { data: otherUser } = await supabase
    .from('users')
    .select('id, full_name, school, course, trust_score')
    .eq('id', userId)
    .single()

  if (!otherUser) redirect('/dashboard/messages')

  // get message history
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(
      'and(sender_id.eq.' + user.id + ',receiver_id.eq.' + userId + '),' +
      'and(sender_id.eq.' + userId + ',receiver_id.eq.' + user.id + ')'
    )
    .order('created_at', { ascending: true })

  // mark messages as read
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('receiver_id', user.id)
    .eq('sender_id', userId)

  // get all contacts for sidebar
  const { data: sent } = await supabase
    .from('messages')
    .select('receiver_id, users!messages_receiver_id_fkey(id, full_name, school)')
    .eq('sender_id', user.id)

  const { data: received } = await supabase
    .from('messages')
    .select('sender_id, users!messages_sender_id_fkey(id, full_name, school)')
    .eq('receiver_id', user.id)

  const { data: tutorBookings } = await supabase
    .from('bookings')
    .select('tutor_id, users!bookings_tutor_id_fkey(id, full_name, school)')
    .eq('learner_id', user.id)
    .eq('status', 'accepted')

  const { data: learnerBookings } = await supabase
    .from('bookings')
    .select('learner_id, users!bookings_learner_id_fkey(id, full_name, school)')
    .eq('tutor_id', user.id)
    .eq('status', 'accepted')

  const contactMap = new Map<string, any>()
  sent?.forEach((m: any) => { if (m.users && m.users.id !== user.id) contactMap.set(m.users.id, m.users) })
  received?.forEach((m: any) => { if (m.users && m.users.id !== user.id) contactMap.set(m.users.id, m.users) })
  tutorBookings?.forEach((b: any) => { if (b.users && b.users.id !== user.id) contactMap.set(b.users.id, b.users) })
  learnerBookings?.forEach((b: any) => { if (b.users && b.users.id !== user.id) contactMap.set(b.users.id, b.users) })

  const contacts = Array.from(contactMap.values())

  return (
    <ChatWindow
      currentUser={user}
      otherUser={otherUser}
      initialMessages={messages || []}
      contacts={contacts}
      activeUserId={userId}
    />
  )
}