import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, BookOpen, MessageSquare,
  LogOut, Calendar, Sparkles,
  ClipboardList, FileText, Shield, GraduationCap
} from 'lucide-react'
import CommandPalette from './components/CommandPalette'
import NotificationPanel from './components/NotificationPanel'
import TabTitle from './components/TabTitle'
import PushNotificationPrompt from './components/PushNotificationPrompt'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('is_specs_member, specs_role, full_name, course, school')
    .eq('id', user.id)
    .single()

  const isSpecsMember = profile?.is_specs_member || false

  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  // Navigation sections
  const primaryNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', badge: null },
    { href: '/dashboard/sessions', icon: Calendar, label: 'Browse Sessions', badge: null },
    { href: '/dashboard/materials', icon: FileText, label: 'Study Materials', badge: null },
    { href: '/dashboard/requests/browse', icon: ClipboardList, label: 'Browse Requests', badge: null },
    { href: '/dashboard/recommendations', icon: Sparkles, label: 'For You', badge: null },
  ]

  const myActivityNavItems = [
    { href: '/dashboard/bookings', icon: Calendar, label: 'My Bookings', badge: null },
    { href: '/dashboard/requests', icon: BookOpen, label: 'My Requests', badge: null },
    {
      href: '/dashboard/messages',
      icon: MessageSquare,
      label: 'Messages',
      badge: unreadCount || null,
    },
  ]

  const specsNavItems = [
    { href: '/dashboard/sessions/new', icon: Calendar, label: 'Post a Session', badge: null },
    { href: '/dashboard/materials/upload', icon: FileText, label: 'Upload Materials', badge: null },
  ]

  const firstName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User'
  const initial = user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-[#FDE8D0] text-[#20251F] flex">
      <TabTitle userId={user.id} />
      <PushNotificationPrompt />

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-64 bg-[#315B3B] border-r border-[#24452D] flex-col fixed h-full z-20 shadow-[2px_0_12px_rgba(0,0,0,0.15)]">
        {/* Brand header */}
        <div className="px-5 py-4 border-b border-[#24452D]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative flex-shrink-0">
              <Image
                src="/specs-logo.png"
                alt="Mentorly SPECS logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[16px] tracking-tight text-white">Mentorly</span>
                <span className="text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded border border-white/20">
                  CCS
                </span>
              </div>
              <p className="text-[11px] text-white/65 truncate font-medium">SPECS Academic Support</p>
            </div>
          </Link>
        </div>

        {/* SPECS Member Status Pill */}
        {isSpecsMember ? (
          <div className="mx-3 mt-3 px-3 py-2 bg-white/15 border border-white/20 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs text-white font-semibold truncate">
              SPECS {profile?.specs_role || 'Mentor'} ⚡
            </span>
          </div>
        ) : (
          <div className="mx-3 mt-3 px-3 py-2 bg-white/10 border border-white/15 rounded-xl flex items-center gap-2">
            <GraduationCap size={14} className="text-[#FAC898]" />
            <span className="text-xs text-white/80 font-medium truncate">
              Gordon College Student
            </span>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {/* Main Marketplace */}
          <div>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
              Marketplace
            </p>
            <div className="space-y-0.5">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-all duration-150 group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white/75 group-hover:text-[#FAC898] group-hover:bg-white/15 transition-colors">
                    <item.icon size={16} />
                  </div>
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* My Activity */}
          <div>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
              My Learning
            </p>
            <div className="space-y-0.5">
              {myActivityNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-all duration-150 group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white/75 group-hover:text-white group-hover:bg-white/15 transition-colors">
                    <item.icon size={16} />
                  </div>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="min-w-5 h-5 px-1 bg-[#F26A21] rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-xs">
                      {(item.badge as number) > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* SPECS Actions */}
          {isSpecsMember && (
            <div>
              <div className="flex items-center justify-between px-3 pb-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                  SPECS Tutors ⚡
                </p>
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="space-y-0.5">
                {specsNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/20 hover:text-white border border-white/20 transition-all duration-150 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-white group-hover:bg-white/30 group-hover:text-white transition-colors">
                      <item.icon size={16} />
                    </div>
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Card */}
        <div className="px-3 py-3 border-t border-[#24452D] bg-[#24452D]/60 space-y-2">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/20"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              isSpecsMember
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-white/15 text-white border border-white/20'
            }`}>
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{firstName}</p>
              <p className="text-[11px] text-white/65 truncate">
                {isSpecsMember ? 'SPECS Mentor ⚡' : (profile?.course || 'Student')}
              </p>
            </div>
          </Link>

          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/65 hover:text-white hover:bg-white/10 transition-all duration-150 w-full group">
              <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform duration-150 text-white/50 group-hover:text-white" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Desktop Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-[#F26A21] border-b border-[#D95416] sticky top-0 z-10 shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
          <div className="flex-1 max-w-lg">
            <CommandPalette />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#D95416] px-3 py-1.5 rounded-full border border-[#D95416]/50">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs font-semibold text-white">Gordon College Campus</span>
            </div>
            <NotificationPanel userId={user.id} />
            <Link
              href="/dashboard/profile"
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all bg-white/20 text-white border border-white/30 hover:ring-2 hover:ring-white/30"
              title="View profile"
            >
              {initial}
            </Link>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 bg-white border-b border-[#E8E5DE] sticky top-0 z-10 shadow-xs">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/specs-logo.png" alt="SPECS logo" width={32} height={32} className="h-8 w-8 object-contain" priority />
            <div>
              <span className="font-bold text-[15px] tracking-tight text-[#20251F]">Mentorly</span>
              <span className="text-[10px] text-[#315B3B] font-bold ml-1.5 bg-[#E8F0E7] px-1 py-0.5 rounded">CCS</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationPanel userId={user.id} />
            <Link
              href="/dashboard/profile"
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                isSpecsMember
                  ? 'bg-[#E8F0E7] text-[#315B3B] border border-[#315B3B]/30'
                  : 'bg-[#FFF0E5] text-[#D95416] border border-[#F26A21]/30'
              }`}
            >
              {initial}
            </Link>
          </div>
        </header>

        {/* Mobile quick navigation pill bar */}
        <div className="flex md:hidden items-center gap-2 px-4 py-2 bg-white border-b border-[#E8E5DE] overflow-x-auto scrollbar-hide text-xs">
          <Link href="/dashboard" className="px-3 py-1 rounded-full bg-[#FFF0E5] text-[#D95416] font-semibold whitespace-nowrap">
            Overview
          </Link>
          <Link href="/dashboard/sessions" className="px-3 py-1 rounded-full bg-[#F5F3ED] text-[#6B716B] font-medium whitespace-nowrap">
            Sessions
          </Link>
          <Link href="/dashboard/materials" className="px-3 py-1 rounded-full bg-[#F5F3ED] text-[#6B716B] font-medium whitespace-nowrap">
            Materials
          </Link>
          <Link href="/dashboard/bookings" className="px-3 py-1 rounded-full bg-[#F5F3ED] text-[#6B716B] font-medium whitespace-nowrap">
            Bookings
          </Link>
          <Link href="/dashboard/messages" className="px-3 py-1 rounded-full bg-[#F5F3ED] text-[#6B716B] font-medium whitespace-nowrap">
            Messages {unreadCount ? `(${unreadCount})` : ''}
          </Link>
        </div>

        {/* Main page content container */}
        <main className="p-4 md:p-8 animate-fade-in max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
