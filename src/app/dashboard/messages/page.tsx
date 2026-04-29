import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // get all unique conversations
  const { data: sent } = await supabase
    .from('messages')
    .select('receiver_id, users!messages_receiver_id_fkey(id, full_name, school)')
    .eq('sender_id', user.id)

  const { data: received } = await supabase
    .from('messages')
    .select('sender_id, users!messages_sender_id_fkey(id, full_name, school)')
    .eq('receiver_id', user.id)

  // get people from accepted bookings to message
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

  // build unique contacts list
  const contactMap = new Map<string, any>()

  sent?.forEach((m: any) => {
    if (m.users && m.users.id !== user.id) contactMap.set(m.users.id, m.users)
  })
  received?.forEach((m: any) => {
    if (m.users && m.users.id !== user.id) contactMap.set(m.users.id, m.users)
  })
  tutorBookings?.forEach((b: any) => {
    if (b.users && b.users.id !== user.id) contactMap.set(b.users.id, b.users)
  })
  learnerBookings?.forEach((b: any) => {
    if (b.users && b.users.id !== user.id) contactMap.set(b.users.id, b.users)
  })

  const contacts = Array.from(contactMap.values())

  return (
    <div className="flex w-full">
      {/* contact list */}
      <div className="w-72 border-r border-white/5 flex flex-col">
        <div className="px-6 py-5 border-b border-white/5">
          <h1 className="text-lg font-bold">Messages</h1>
          <p className="text-white/30 text-xs mt-0.5">Your conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <Link
                key={contact.id}
                href={'/dashboard/messages/' + contact.id}
                className="flex items-center gap-3 px-4 py-4 hover:bg-white/3 border-b border-white/5 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-sm font-medium text-[#4a8fd4] flex-shrink-0">
                  {contact.full_name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{contact.full_name}</p>
                  <p className="text-xs text-white/30 truncate">{contact.school}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-white/30 text-xs">No conversations yet</p>
              <p className="text-white/20 text-xs mt-1">Book a session to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* empty state */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Select a conversation</p>
          <p className="text-white/20 text-xs mt-1">Choose someone from the left to start chatting</p>
        </div>
      </div>
    </div>
  )
}