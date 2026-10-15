'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Search, LayoutDashboard, BookOpen,
  MessageSquare, Calendar, Sparkles,
  ArrowRight, FileText, ClipboardList,
  User, Bell, Plus, Shield
} from 'lucide-react'

type Command = {
  id: string
  label: string
  icon: any
  href: string
  group: string
  specsOnly?: boolean
}

const ALL_COMMANDS: Command[] = [
  // navigate — all users
  { id: 'overview', label: 'Go to Overview', icon: LayoutDashboard, href: '/dashboard', group: 'Navigate' },
  { id: 'sessions', label: 'Browse Sessions', icon: Calendar, href: '/dashboard/sessions', group: 'Navigate' },
  { id: 'materials', label: 'Study Materials', icon: FileText, href: '/dashboard/materials', group: 'Navigate' },
  { id: 'requests-browse', label: 'Browse Requests', icon: ClipboardList, href: '/dashboard/requests/browse', group: 'Navigate' },
  { id: 'foryou', label: 'Recommended For You', icon: Sparkles, href: '/dashboard/recommendations', group: 'Navigate' },
  { id: 'bookings', label: 'My Bookings', icon: Calendar, href: '/dashboard/bookings', group: 'Navigate' },
  { id: 'requests', label: 'My Requests', icon: BookOpen, href: '/dashboard/requests', group: 'Navigate' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages', group: 'Navigate' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications', group: 'Navigate' },
  { id: 'profile', label: 'My Profile & Settings', icon: User, href: '/dashboard/profile', group: 'Navigate' },
  // actions — all users
  { id: 'new-request', label: 'Post a Help Request', icon: Plus, href: '/dashboard/requests/new', group: 'Actions' },
  // SPECS only
  { id: 'new-session', label: 'Post a New Session', icon: Plus, href: '/dashboard/sessions/new', group: 'SPECS Tutors', specsOnly: true },
  { id: 'upload-material', label: 'Upload Study Material', icon: Plus, href: '/dashboard/materials/upload', group: 'SPECS Tutors', specsOnly: true },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const [isSpecsMember, setIsSpecsMember] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('is_specs_member')
        .eq('id', user.id)
        .single()
      setIsSpecsMember(data?.is_specs_member || false)
    }
    checkRole()
  }, [])

  const commands = ALL_COMMANDS.filter((c) =>
    !c.specsOnly || isSpecsMember
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
        setQuery('')
        setSelected(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )

  const groups = ['Navigate', 'Actions', 'SPECS Tutors'].map((g) => ({
    name: g,
    items: filtered.filter((c) => c.group === g),
  })).filter((g) => g.items.length > 0)

  function execute(href: string) {
    router.push(href)
    setOpen(false)
    setQuery('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((prev) => (prev + 1) % Math.max(filtered.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((prev) => (prev - 1 + filtered.length) % Math.max(filtered.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selected]) {
        execute(filtered[selected].href)
      }
    }
  }

  return (
    <>
      {/* Top bar trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full max-w-sm flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-[#F5F3ED] hover:bg-[#EBE7DD] border border-[#E8E5DE] transition-all text-xs text-[#6B716B] group shadow-xs"
      >
        <div className="flex items-center gap-2.5 truncate">
          <Search size={14} className="text-[#939A92] group-hover:text-[#F26A21] transition-colors" />
          <span className="truncate">Search sessions, materials, requests...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-[#6B716B] bg-white border border-[#E8E5DE] rounded shadow-2xs">
          ⌘K
        </kbd>
      </button>

      {/* Modal Backdrop & Palette */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/35 backdrop-blur-xs animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white border border-[#E8E5DE] rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E8E5DE] bg-[#FFFCF7]">
              <Search size={16} className="text-[#F26A21] flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelected(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search destination..."
                className="w-full bg-transparent text-sm text-[#20251F] placeholder:text-[#939A92] focus:outline-none"
              />
              <kbd className="text-[10px] font-bold text-[#939A92] bg-[#F5F3ED] border border-[#E8E5DE] px-1.5 py-0.5 rounded">
                ESC
              </kbd>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-[#6B716B]">No matching commands found</p>
                  <p className="text-xs text-[#939A92] mt-1">Try searching for sessions, materials, or profile</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.name} className="mb-2 last:mb-0">
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#939A92]">
                      {group.name}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((cmd) => {
                        const globalIndex = filtered.indexOf(cmd)
                        const isSelected = globalIndex === selected
                        return (
                          <div
                            key={cmd.id}
                            onClick={() => execute(cmd.href)}
                            onMouseEnter={() => setSelected(globalIndex)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-[#FFF0E5] text-[#D95416]'
                                : 'text-[#20251F] hover:bg-[#F5F3ED]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-white text-[#F26A21] shadow-2xs'
                                    : 'bg-[#F5F3ED] text-[#6B716B]'
                                }`}
                              >
                                <cmd.icon size={15} />
                              </div>
                              <span className="truncate">{cmd.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {cmd.specsOnly && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8F0E7] text-[#315B3B] border border-[#315B3B]/20">
                                  SPECS
                                </span>
                              )}
                              <ArrowRight
                                size={12}
                                className={isSelected ? 'text-[#D95416] opacity-100' : 'opacity-0'}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-[#FFFCF7] border-t border-[#E8E5DE] flex items-center justify-between text-[11px] text-[#6B716B]">
              <span>Navigate with <kbd className="font-semibold text-[#20251F]">↑</kbd> <kbd className="font-semibold text-[#20251F]">↓</kbd></span>
              <span>Press <kbd className="font-semibold text-[#20251F]">Enter</kbd> to select</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}