'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, LayoutDashboard, BookOpen, Briefcase,
  MessageSquare, Calendar, Sparkles, ArrowLeftRight,
  ClipboardList, User, Bell, Plus, ArrowRight
} from 'lucide-react'

const COMMANDS = [
  { id: 'overview', label: 'Go to Overview', icon: LayoutDashboard, href: '/dashboard', group: 'Navigate' },
  { id: 'marketplace', label: 'Browse Marketplace', icon: Search, href: '/dashboard/marketplace', group: 'Navigate' },
  { id: 'requests', label: 'Browse Requests', icon: ClipboardList, href: '/dashboard/requests/browse', group: 'Navigate' },
  { id: 'trades', label: 'Skill Swap', icon: ArrowLeftRight, href: '/dashboard/trades', group: 'Navigate' },
  { id: 'foryou', label: 'For You', icon: Sparkles, href: '/dashboard/recommendations', group: 'Navigate' },
  { id: 'bookings', label: 'My Bookings', icon: Calendar, href: '/dashboard/bookings', group: 'Navigate' },
  { id: 'myrequests', label: 'My Requests', icon: BookOpen, href: '/dashboard/requests', group: 'Navigate' },
  { id: 'myservices', label: 'My Services', icon: Briefcase, href: '/dashboard/services', group: 'Navigate' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages', group: 'Navigate' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications', group: 'Navigate' },
  { id: 'profile', label: 'My Profile', icon: User, href: '/dashboard/profile', group: 'Navigate' },
  { id: 'new-service', label: 'List a new service', icon: Plus, href: '/dashboard/services/new', group: 'Actions' },
  { id: 'new-request', label: 'Post a help request', icon: Plus, href: '/dashboard/requests/new', group: 'Actions' },
  { id: 'new-trade', label: 'Post a skill swap', icon: Plus, href: '/dashboard/trades/new', group: 'Actions' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )

  const groups = ['Navigate', 'Actions'].map((g) => ({
    name: g,
    items: filtered.filter((c) => c.group === g),
  })).filter((g) => g.items.length > 0)

  function execute(href: string) {
    router.push(href)
    setOpen(false)
    setQuery('')
  }

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      }
      if (e.key === 'Enter' && filtered[selected]) {
        execute(filtered[selected].href)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, selected])

  if (!open) return (
    <button
      onClick={() => { setOpen(true); setQuery(''); setSelected(0) }}
      className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 text-xs text-white/30 hover:text-white/50 transition-all"
    >
      <Search size={12} />
      Quick jump...
      <span className="ml-1 bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</span>
    </button>
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* palette */}
      <div className="relative w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* search */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
          <Search size={15} className="text-white/30 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
            placeholder="Search pages and actions..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/20 focus:outline-none"
          />
          <span className="text-[10px] text-white/20 bg-white/5 px-1.5 py-1 rounded font-mono">ESC</span>
        </div>

        {/* results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {groups.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-white/30">No results for "{query}"</div>
          ) : (
            groups.map((group) => {
              let globalIdx = 0
              return (
                <div key={group.name}>
                  <p className="px-4 py-2 text-[10px] text-white/20 uppercase tracking-widest">{group.name}</p>
                  {group.items.map((item) => {
                    const idx = filtered.indexOf(item)
                    return (
                      <button
                        key={item.id}
                        onClick={() => execute(item.href)}
                        onMouseEnter={() => setSelected(idx)}
                        className={
                          'w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ' +
                          (selected === idx ? 'bg-[#26619C]/20' : 'hover:bg-white/3')
                        }
                      >
                        <item.icon size={14} className={selected === idx ? 'text-[#4a8fd4]' : 'text-white/30'} />
                        <span className={'text-sm ' + (selected === idx ? 'text-white' : 'text-white/60')}>
                          {item.label}
                        </span>
                        {selected === idx && (
                          <ArrowRight size={12} className="ml-auto text-white/30" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        <div className="border-t border-white/5 px-4 py-2.5 flex items-center gap-4 text-[10px] text-white/20">
          <span className="flex items-center gap-1"><span className="font-mono bg-white/5 px-1 rounded">↑↓</span> navigate</span>
          <span className="flex items-center gap-1"><span className="font-mono bg-white/5 px-1 rounded">↵</span> open</span>
          <span className="flex items-center gap-1"><span className="font-mono bg-white/5 px-1 rounded">esc</span> close</span>
        </div>
      </div>
    </div>
  )
}