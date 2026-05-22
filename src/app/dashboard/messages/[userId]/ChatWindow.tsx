'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Star, Paperclip, X, FileText, Download } from 'lucide-react'
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

    return () => { supabase.removeChannel(channel) }
  }, [currentUser.id, otherUser.id])

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function isImage(fileType?: string) {
    return fileType?.startsWith('image/')
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

    const { error } = await supabase.storage
      .from('chat-files')
      .upload(path, file)

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data } = supabase.storage.from('chat-files').getPublicUrl(path)
    return {
      url: data.publicUrl,
      name: file.name,
      type: file.type,
      size: file.size,
    }
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

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-PH', {
      hour: '2-digit', minute: '2-digit',
    })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric',
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

  // ── THE FIX: proper JSX with all attributes inside the opening tag ──
  function FileAttachment({ msg }: { msg: Message }) {
    if (!msg.file_url) return null

    if (isImage(msg.file_type)) {
      return (
        
          href={msg.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2"
        >
          <img
            src={msg.file_url}
            alt={msg.file_name || 'Image'}
            className="max-w-[240px] rounded-xl border border-white/10 hover:opacity-90 transition-opacity cursor-pointer"
          />
          <p className="text-[10px] text-white/30 mt-1">{msg.file_name}</p>
        </a>
      )
    }

    // document / file — all props INSIDE the opening <a> tag
    return (
      
        href={msg.file_url}
        target="_blank"
        rel="noopener noreferrer"
        download={msg.file_name}
        className="flex items-center gap-3 mt-2 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 transition-all group max-w-xs cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <FileText size={15} className="text-white/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white/80 truncate group-hover:text-white transition-colors">
            {msg.file_name}
          </p>
          {msg.file_size && (
            <p className="text-[10px] text-white/40">{formatFileSize(msg.file_size)}</p>
          )}
        </div>
        <Download size={13} className="text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
      </a>
    )
  }

  const grouped = groupByDate(messages)

  return (
    <div className="flex w-full">

      {/* sidebar contacts */}
      <div className="w-72 border-r border-white/5 flex-col flex-shrink-0 hidden md:flex">
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
        <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-white/5 flex-shrink-0">
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
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
          {grouped.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center mx-auto mb-3">
                  <Send size={16} className="text-[#4a8fd4]" />
                </div>
                <p className="text-white/30 text-sm">No messages yet</p>
                <p className="text-white/20 text-xs mt-1">
                  Say hi to {otherUser.full_name?.split(' ')[0]}!
                </p>
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
                      <div className={
                        'max-w-xs lg:max-w-md flex flex-col gap-1 ' +
                        (isMe ? 'items-end' : 'items-start')
                      }>
                        {msg.content && (
                          <div className={
                            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed ' +
                            (isMe
                              ? 'bg-[#26619C] text-white rounded-br-md'
                              : 'bg-white/5 text-white/80 border border-white/8 rounded-bl-md')
                          }>
                            {msg.content}
                          </div>
                        )}
                        <FileAttachment msg={msg} />
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

        {/* selected file preview */}
        {selectedFile && (
          <div className="px-4 md:px-6 py-2 border-t border-white/5 flex-shrink-0">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-[#26619C]/20 flex items-center justify-center flex-shrink-0">
                <FileText size={13} className="text-[#4a8fd4]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/70 truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-white/30">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* input bar */}
        <div className="px-4 md:px-6 py-4 border-t border-white/5 flex-shrink-0">
          <div className="flex items-end gap-2 md:gap-3">

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors rounded-xl flex items-center justify-center flex-shrink-0 text-white/30 hover:text-white"
              title="Attach file or document"
            >
              <Paperclip size={15} />
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
              placeholder={'Message ' + (otherUser.full_name?.split(' ')[0] || 'them') + '...'}
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
            />

            <button
              onClick={sendMessage}
              disabled={sending || (!content.trim() && !selectedFile)}
              className="w-10 h-10 bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-30 transition-colors rounded-xl flex items-center justify-center flex-shrink-0"
            >
              {uploadProgress
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send size={15} />
              }
            </button>
          </div>
          <p className="text-white/20 text-xs mt-2">
            Enter to send · Shift+Enter for new line · 📎 Max 10MB
          </p>
        </div>
      </div>
    </div>
  )
}