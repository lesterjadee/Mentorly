'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uniqueRealtimeTopic } from '@/lib/supabase/realtime'
import { Send, Star, Paperclip, X, FileText, Download, ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  is_read: boolean
  file_url?: string
  file_name?: string
  file_type?: string
  file_size?: number
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(uniqueRealtimeTopic('messages-' + otherUser.id, currentUser.id))
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
    return () => { supabase.removeChannel(channel) }
  }, [currentUser.id, otherUser.id])

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function isImage(fileType?: string): boolean {
    return fileType?.startsWith('image/') ?? false
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB.')
      return
    }
    setSelectedFile(file)
  }

  async function uploadFile(file: File): Promise<{ url: string; name: string; type: string; size: number } | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = currentUser.id + '/' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('chat-files').upload(path, file)
    if (error) { console.error('Upload error:', error); return null }
    const { data } = supabase.storage.from('chat-files').getPublicUrl(path)
    return { url: data.publicUrl, name: file.name, type: file.type, size: file.size }
  }

  async function sendMessage() {
    if (!content.trim() && !selectedFile) return
    setSending(true)
    setUploadProgress(!!selectedFile)
    const supabase = createClient()
    let fileData: { url: string; name: string; type: string; size: number } | null = null

    if (selectedFile) {
      fileData = await uploadFile(selectedFile)
      setUploadProgress(false)
      if (!fileData) {
        setSending(false)
        alert('Failed to upload file. Please try again.')
        return
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: otherUser.id,
        content: content.trim() || '',
        file_url: fileData?.url || null,
        file_name: fileData?.name || null,
        file_type: fileData?.type || null,
        file_size: fileData?.size || null,
      })
      .select()
      .single()

    if (!error && data) {
      setMessages((prev) => [...prev, data])
      setContent('')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    setSending(false)
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  }

  function groupByDate(msgs: Message[]): { date: string; messages: Message[] }[] {
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

  // uses onClick + window.open to avoid anchor tag rendering issues
  function renderFileAttachment(msg: Message, isMe: boolean): React.ReactNode {
    if (!msg.file_url) return null

    if (isImage(msg.file_type)) {
      return (
        <div
          className="mt-2 cursor-pointer"
          onClick={() => window.open(msg.file_url, '_blank')}
        >
          <img
            src={msg.file_url}
            alt={msg.file_name || 'Image'}
            className="max-w-[240px] rounded-xl border border-[#E8E5DE] shadow-xs hover:opacity-95 transition-opacity"
          />
          <p className={isMe ? 'text-[10px] text-white/80 mt-1 font-medium' : 'text-[10px] text-[#6B716B] mt-1'}>
            {msg.file_name}
          </p>
        </div>
      )
    }

    return (
      <div
        className={
          'flex items-center gap-3 mt-2 rounded-xl px-3.5 py-2.5 transition-all cursor-pointer max-w-xs group shadow-xs ' +
          (isMe
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-white hover:bg-[#FFF0E5] border border-[#E8E5DE] text-[#20251F]')
        }
        onClick={() => {
          if (msg.file_url) window.open(msg.file_url, '_blank')
        }}
      >
        <div className={
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ' +
          (isMe ? 'bg-white/20 text-white' : 'bg-[#E8F0E7] text-[#315B3B]')
        }>
          <FileText size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">
            {msg.file_name}
          </p>
          {msg.file_size !== undefined && msg.file_size !== null && (
            <p className={isMe ? 'text-[10px] text-white/80' : 'text-[10px] text-[#6B716B]'}>
              {formatFileSize(msg.file_size)}
            </p>
          )}
        </div>
        <Download size={14} className={isMe ? 'text-white/80' : 'text-[#6B716B] group-hover:text-[#F26A21]'} />
      </div>
    )
  }

  const grouped = groupByDate(messages)

  return (
    <div className="flex w-full h-full">

      {/* Sidebar Contacts */}
      <div className="w-80 border-r border-[#E8E5DE] bg-[#FFFCF7] flex-col flex-shrink-0 hidden md:flex">
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
            contacts.map((contact) => {
              const isActive = contact.id === activeUserId
              return (
                <Link
                  key={contact.id}
                  href={'/dashboard/messages/' + contact.id}
                  className={
                    'flex items-center gap-3 px-5 py-4 transition-colors group ' +
                    (isActive
                      ? 'bg-white border-l-4 border-l-[#F26A21] shadow-xs'
                      : 'hover:bg-white')
                  }
                >
                  <div className={
                    'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-xs ' +
                    (isActive
                      ? 'bg-[#F26A21] text-white'
                      : 'bg-[#FFF0E5] text-[#F26A21] border border-[#F26A21]/20')
                  }>
                    {contact.full_name?.[0] ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={
                      'text-sm font-semibold truncate transition-colors ' +
                      (isActive ? 'text-[#F26A21]' : 'text-[#20251F] group-hover:text-[#F26A21]')
                    }>
                      {contact.full_name}
                    </p>
                    <p className="text-xs text-[#6B716B] truncate">{contact.school || 'Gordon College'}</p>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#6B716B]">
              No other conversations
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">

        {/* Chat Header */}
        <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-[#E8E5DE] bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/messages"
              className="md:hidden w-8 h-8 rounded-lg bg-[#F5F3ED] flex items-center justify-center text-[#20251F]"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center text-sm font-bold text-[#315B3B] shadow-xs">
              {otherUser.full_name?.[0] ?? '?'}
            </div>
            <div>
              <p className="font-bold text-sm text-[#20251F]">{otherUser.full_name}</p>
              <p className="text-xs text-[#6B716B]">{otherUser.course || 'Gordon College Student'} · {otherUser.school || 'Gordon College'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(otherUser.trust_score ?? 0) > 0 ? (
              <div className="flex items-center gap-1 bg-[#E8F0E7] text-[#315B3B] border border-[#315B3B]/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                <Star size={12} className="text-[#315B3B] fill-[#315B3B]" />
                <span>{otherUser.trust_score} Trust Score</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-[#E8F0E7] text-[#315B3B] border border-[#315B3B]/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                <ShieldCheck size={12} />
                <span>Verified Peer</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 bg-[#FFFCF7]/40">
          {grouped.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center mx-auto mb-3 text-[#F26A21]">
                  <Send size={18} />
                </div>
                <p className="text-sm font-semibold text-[#20251F]">No messages yet</p>
                <p className="text-xs text-[#6B716B] mt-1">
                  Say hi to {otherUser.full_name?.split(' ')[0]} and coordinate your tutoring session!
                </p>
              </div>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.date}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#E8E5DE]" />
                <span className="text-[11px] font-semibold text-[#6B716B] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-[#E8E5DE]">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-[#E8E5DE]" />
              </div>
              <div className="space-y-2.5">
                {group.messages.map((msg) => {
                  const isMe = msg.sender_id === currentUser.id
                  return (
                    <div key={msg.id} className={'flex ' + (isMe ? 'justify-end' : 'justify-start')}>
                      <div className={'max-w-xs lg:max-w-md flex flex-col gap-1 ' + (isMe ? 'items-end' : 'items-start')}>
                        {msg.content && (
                          <div className={
                            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ' +
                            (isMe
                              ? 'bg-[#F26A21] text-white rounded-br-xs font-normal'
                              : 'bg-white text-[#20251F] border border-[#E8E5DE] rounded-bl-xs')
                          }>
                            {msg.content}
                          </div>
                        )}
                        {renderFileAttachment(msg, isMe)}
                        <span className="text-[10px] text-[#6B716B]/70 px-1 font-medium">{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="px-4 md:px-6 py-2.5 bg-[#FFF0E5] border-t border-[#F26A21]/20 flex-shrink-0">
            <div className="flex items-center gap-3 bg-white border border-[#F26A21]/30 rounded-xl px-3 py-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0E5] text-[#F26A21] flex items-center justify-center flex-shrink-0">
                <FileText size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#20251F] truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-[#6B716B]">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="text-[#6B716B] hover:text-[#20251F] transition-colors p-1"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="px-4 md:px-6 py-4 border-t border-[#E8E5DE] bg-white flex-shrink-0">
          <div className="flex items-end gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 bg-[#F5F3ED] hover:bg-[#E8F0E7] border border-[#E8E5DE] text-[#315B3B] hover:text-[#24452D] transition-colors rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs"
              title="Attach study file, note, or syllabus"
            >
              <Paperclip size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder={'Message ' + (otherUser.full_name?.split(' ')[0] || 'peer') + '...'}
              rows={1}
              className="flex-1 bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-3 text-[#20251F] text-sm placeholder-[#6B716B]/60 focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all resize-none"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || (!content.trim() && !selectedFile)}
              className="w-10 h-10 bg-[#F26A21] hover:bg-[#D95416] text-white disabled:opacity-40 transition-colors rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs"
            >
              {uploadProgress
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send size={15} />
              }
            </button>
          </div>
          <p className="text-[#6B716B] text-[11px] mt-2">
            Press Enter to send · Shift+Enter for new line · 📎 Max 10MB study attachments
          </p>
        </div>
      </div>
    </div>
  )
}
