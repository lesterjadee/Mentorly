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
    <div className="min-h-screen bg-[#FFFCF7] text-[#20251F] flex">
      <TabTitle userId={user.id} />
      <PushNotificationPrompt />

      {/* ── DESKTOP SIDEBAR (BudgetMate inspired) ── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#E8E5DE] flex-col fixed h-full z-20 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        {/* Brand header */}
        <div className="px-5 py-4 border-b border-[#E8E5DE]">
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
                <span className="font-bold text-[16px] tracking-tight text-[#20251F]">Mentorly</span>
                <span className="text-[10px] font-bold bg-[#E8F0E7] text-[#315B3B] px-1.5 py-0.5 rounded border border-[#315B3B]/20">
                  CCS
                </span>
              </div>
              <p className="text-[11px] text-[#6B716B] truncate font-medium">SPECS Academic Support</p>
            </div>
          </Link>
        </div>

        {/* SPECS Member Status Pill */}
        {isSpecsMember ? (
          <div className="mx-3 mt-3 px-3 py-2 bg-[#E8F0E7] border border-[#315B3B]/20 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#315B3B] animate-pulse" />
            <span className="text-xs text-[#315B3B] font-semibold truncate">
              SPECS {profile?.specs_role || 'Mentor'} ⚡
            </span>
          </div>
        ) : (
          <div className="mx-3 mt-3 px-3 py-2 bg-[#FFF8F1] border border-[#F26A21]/15 rounded-xl flex items-center gap-2">
            <GraduationCap size={14} className="text-[#F26A21]" />
            <span className="text-xs text-[#D95416] font-medium truncate">
              Gordon College Student
            </span>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {/* Main Marketplace */}
          <div>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#939A92]">
              Marketplace
            </p>
            <div className="space-y-0.5">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B716B] hover:text-[#20251F] hover:bg-[#F5F3ED] transition-all duration-150 group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B716B] group-hover:text-[#F26A21] group-hover:bg-[#FFF0E5] transition-colors">
                    <item.icon size={16} />
                  </div>
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* My Activity */}
          <div>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#939A92]">
              My Learning
            </p>
            <div className="space-y-0.5">
              {myActivityNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B716B] hover:text-[#20251F] hover:bg-[#F5F3ED] transition-all duration-150 group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B716B] group-hover:text-[#315B3B] group-hover:bg-[#E8F0E7] transition-colors">
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
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#315B3B]">
                  SPECS Tutors ⚡
                </p>
                <span className="w-1.5 h-1.5 rounded-full bg-[#315B3B]" />
              </div>
              <div className="space-y-0.5">
                {specsNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#315B3B] bg-[#E8F0E7]/40 hover:bg-[#E8F0E7] hover:text-[#24452D] border border-[#315B3B]/10 transition-all duration-150 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#E8F0E7] flex items-center justify-center text-[#315B3B] group-hover:bg-[#315B3B] group-hover:text-white transition-colors">
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
        <div className="px-3 py-3 border-t border-[#E8E5DE] bg-[#FFFCF7]/60 space-y-2">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-all border border-transparent hover:border-[#E8E5DE]"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              isSpecsMember
                ? 'bg-[#E8F0E7] text-[#315B3B] border border-[#315B3B]/30'
                : 'bg-[#FFF0E5] text-[#D95416] border border-[#F26A21]/30'
            }`}>
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#20251F] truncate">{firstName}</p>
              <p className="text-[11px] text-[#6B716B] truncate">
                {isSpecsMember ? 'SPECS Mentor ⚡' : (profile?.course || 'Student')}
              </p>
            </div>
          </Link>

          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#6B716B] hover:text-[#D95416] hover:bg-[#FFF0E5] transition-all duration-150 w-full group">
              <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform duration-150 text-[#939A92] group-hover:text-[#D95416]" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Desktop Top Header (BudgetMate style) */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white/90 backdrop-blur-md border-b border-[#E8E5DE] sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex-1 max-w-lg">
            <CommandPalette />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F5F3ED] px-3 py-1.5 rounded-full border border-[#E8E5DE]">
              <span className="w-2 h-2 rounded-full bg-[#315B3B]" />
              <span className="text-xs font-semibold text-[#315B3B]">Gordon College Campus</span>
            </div>
            <NotificationPanel userId={user.id} />
            <Link
              href="/dashboard/profile"
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isSpecsMember
                  ? 'bg-[#E8F0E7] text-[#315B3B] border border-[#315B3B]/30 hover:ring-2 hover:ring-[#315B3B]/20'
                  : 'bg-[#FFF0E5] text-[#D95416] border border-[#F26A21]/30 hover:ring-2 hover:ring-[#F26A21]/20'
              }`}
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
