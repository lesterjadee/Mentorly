import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  LayoutDashboard, BookOpen, Briefcase, MessageSquare,
  Bell, LogOut, Search, Calendar, Sparkles,
  ClipboardList, ArrowLeftRight
} from 'lucide-react'
import CommandPalette from './components/CommandPalette'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role || 'both'

  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  const { count: notifCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', user.id)
    .eq('status', 'pending')

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', badge: null },
    { href: '/dashboard/marketplace', icon: Search, label: 'Marketplace', badge: null },
    { href: '/dashboard/requests/browse', icon: ClipboardList, label: 'Browse Requests', badge: null },
    { href: '/dashboard/trades', icon: ArrowLeftRight, label: 'Skill Swap', badge: null },
    { href: '/dashboard/recommendations', icon: Sparkles, label: 'For You', badge: null },
    { href: '/dashboard/bookings', icon: Calendar, label: 'Bookings', badge: null },
    { href: '/dashboard/requests', icon: BookOpen, label: 'My Requests', badge: null },
    { href: '/dashboard/services', icon: Briefcase, label: 'My Services', badge: null },
    {
      href: '/dashboard/messages',
      icon: MessageSquare,
      label: 'Messages',
      badge: unreadCount || null
    },
  ]

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'User'
  const totalNotifs = notifCount || 0

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex">

      {/* ── SIDEBAR ── */}
      <aside className="w-60 border-r border-white/5 flex flex-col fixed h-full z-20">

        {/* logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#26619C] flex items-center justify-center shadow-lg shadow-[#26619C]/20">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none"/>
                <circle cx="7" cy="7" r="2" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight">Mentorly</span>
          </div>
        </div>

        {/* nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-white/40 hover:text-white hover:bg-white/5"
            >
              <item.icon size={16} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="w-5 h-5 bg-[#26619C] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {(item.badge as number) > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* user card */}
        <div className="px-4 py-3 mx-3 mb-2 bg-white/3 border border-white/8 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-xs font-bold text-[#4a8fd4] flex-shrink-0">
              {user.user_metadata?.full_name?.[0] || user.email?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{firstName}</p>
              <p className="text-[10px] text-white/30 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* sign out */}
        <div className="px-3 py-3 border-t border-white/5">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all duration-150 w-full group">
              <LogOut size={16} className="group-hover:rotate-12 transition-transform duration-200" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 ml-60">

        {/* sticky header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 sticky top-0 bg-[#080C14]/80 backdrop-blur-sm z-10">
          <CommandPalette />
          <div className="flex items-center gap-2">

            {/* notifications bell */}
            <Link
              href="/dashboard/notifications"
              className="relative w-9 h-9 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-150"
            >
              <Bell size={17} />
              {totalNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#26619C] rounded-full animate-pulse" />
              )}
            </Link>

            {/* profile avatar */}
            <Link
              href="/dashboard/profile"
              className="w-9 h-9 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 hover:border-[#26619C]/60 flex items-center justify-center text-xs font-bold text-[#4a8fd4] transition-all duration-150"
            >
              {user.user_metadata?.full_name?.[0] || user.email?.[0]}
            </Link>
          </div>
        </header>

        {/* page content */}
        <main className="p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  )
}