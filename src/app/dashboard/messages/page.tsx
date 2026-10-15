import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageSquare, Users } from 'lucide-react'
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
    <div className="flex w-full h-full">
      {/* Contact List Sidebar */}
      <div className="w-80 border-r border-[#E8E5DE] bg-[#FFFCF7] flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-[#E8E5DE] bg-white">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E8F0E7] text-[#315B3B] text-[11px] font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#315B3B]" />
            Direct Messages
          </div>
          <h1 className="text-lg font-bold text-[#20251F]">Conversations</h1>
          <p className="text-[#6B716B] text-xs">Chat with your peer tutors and learners</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E8E5DE]">
          {contacts.length > 0 ? (
            contacts.map((contact, idx) => (
              <Link
                key={contact.id}
                href={'/dashboard/messages/' + contact.id}
                className="flex items-center gap-3 px-5 py-4 hover:bg-white transition-colors group"
              >
                <div className={
                  'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-xs ' +
                  (idx % 2 === 0
                    ? 'bg-[#FFF0E5] border border-[#F26A21]/20 text-[#F26A21]'
                    : 'bg-[#E8F0E7] border border-[#315B3B]/20 text-[#315B3B]')
                }>
                  {contact.full_name?.[0] ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#20251F] group-hover:text-[#F26A21] transition-colors truncate">
                    {contact.full_name}
                  </p>
                  <p className="text-xs text-[#6B716B] truncate">{contact.school || 'Gordon College'}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E5] text-[#F26A21] flex items-center justify-center mx-auto mb-3">
                <Users size={20} />
              </div>
              <p className="text-sm font-semibold text-[#20251F]">No conversations yet</p>
              <p className="text-xs text-[#6B716B] mt-1 max-w-[180px] mx-auto">
                Book a peer session or accept a tutor offer to start chatting
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Empty State Main Area */}
      <div className="flex-1 hidden md:flex items-center justify-center bg-white p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-[#F26A21] mx-auto mb-4 shadow-xs">
            <MessageSquare size={28} />
          </div>
          <h2 className="text-lg font-bold text-[#20251F]">Select a conversation</h2>
          <p className="text-sm text-[#6B716B] mt-1.5 leading-relaxed">
            Choose a tutor or peer learner from the sidebar to review messages, exchange study files, or coordinate sessions.
          </p>
        </div>
      </div>
    </div>
  )
}