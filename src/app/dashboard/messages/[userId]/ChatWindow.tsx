'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Star } from 'lucide-react'
import Link from 'next/link'

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  is_read: boolean
}

type User = {
  id: string
  full_name?: string
  school?: string
  course?: string
  trust_score?: number
  email?: string
}

type Props = {
  currentUser: User
  otherUser: User
  initialMessages: Message[]
  contacts: User[]
  activeUserId: string
}

export default function ChatWindow({
  currentUser,
  otherUser,
  initialMessages,
  contacts,
  activeUserId,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('messages-' + currentUser.id + '-' + otherUser.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'receiver_id=eq.' + currentUser.id,
        },
        (payload) => {
          const newMsg = payload.new as Message
          if (newMsg.sender_id === otherUser.id) {
            setMessages((prev) => [...prev, newMsg])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser.id, otherUser.id])

  async function sendMessage() {
    if (!content.trim()) return
    setSending(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: otherUser.id,
        content: content.trim(),
      })
      .select()
      .single()

    if (!error && data) {
      setMessages((prev) => [...prev, data])
      setContent('')
    }
    setSending(false)
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
    })
  }

  function groupByDate(msgs: Message[]) {
    const groups: { date: string; messages: Message[] }[] = []
    let currentDate = ''
    msgs.forEach((msg) => {
      const date = formatDate(msg.created_at)
      if (date !== currentDate) {
        currentDate = date
        groups.push({ date, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    })
    return groups
  }

  const grouped = groupByDate(messages)

  return (
    <div className="flex w-full">

      {/* sidebar contacts */}
      <div className="w-72 border-r border-white/5 flex flex-col flex-shrink-0">
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
                className={
                  'flex items-center gap-3 px-4 py-4 border-b border-white/5 transition-colors ' +
                  (contact.id === activeUserId ? 'bg-white/5' : 'hover:bg-white/3')
                }
              >
                <div className={
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ' +
                  (contact.id === activeUserId
                    ? 'bg-[#26619C] text-white border border-[#26619C]'
                    : 'bg-[#26619C]/20 border border-[#26619C]/30 text-[#4a8fd4]')
                }>
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
            </div>
          )}
        </div>
      </div>

      {/* chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* chat header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-sm font-medium text-[#4a8fd4]">
            {otherUser.full_name?.[0]}
          </div>
          <div>
            <p className="font-medium text-sm">{otherUser.full_name}</p>
            <p className="text-xs text-white/30">{otherUser.course} · {otherUser.school}</p>
          </div>
          {(otherUser.trust_score ?? 0) > 0 && (
            <div className="ml-auto flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-white/40">{otherUser.trust_score}</span>
            </div>
          )}
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {grouped.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center mx-auto mb-3">
                  <Send size={16} className="text-[#4a8fd4]" />
                </div>
                <p className="text-white/30 text-sm">No messages yet</p>
                <p className="text-white/20 text-xs mt-1">Say hi to {otherUser.full_name?.split(' ')[0]}!</p>
              </div>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.date}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-white/20">{group.date}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="space-y-2">
                {group.messages.map((msg) => {
                  const isMe = msg.sender_id === currentUser.id
                  return (
                    <div
                      key={msg.id}
                      className={'flex ' + (isMe ? 'justify-end' : 'justify-start')}
                    >
                      <div className={'max-w-xs lg:max-w-md ' + (isMe ? 'items-end' : 'items-start') + ' flex flex-col gap-1'}>
                        <div className={
                          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed ' +
                          (isMe
                            ? 'bg-[#26619C] text-white rounded-br-md'
                            : 'bg-white/5 text-white/80 border border-white/8 rounded-bl-md')
                        }>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-white/20 px-1">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* input */}
        <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
          <div className="flex items-end gap-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder={'Message ' + otherUser.full_name?.split(' ')[0] + '...'}
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !content.trim()}
              className="w-10 h-10 bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-30 transition-colors rounded-xl flex items-center justify-center flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-white/20 text-xs mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}