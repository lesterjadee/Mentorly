import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, BookOpen, MessageSquare,
  LogOut, Calendar, Sparkles,
  ClipboardList, FileText, Bell
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
    .select('is_specs_member, specs_role, full_name')
    .eq('id', user.id)
    .single()

  const isSpecsMember = profile?.is_specs_member || false

  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  // nav items visible to ALL users
  const studentNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', badge: null },
    { href: '/dashboard/sessions', icon: Calendar, label: 'Browse Sessions', badge: null },
    { href: '/dashboard/materials', icon: FileText, label: 'Study Materials', badge: null },
    { href: '/dashboard/requests/browse', icon: ClipboardList, label: 'Browse Requests', badge: null },
    { href: '/dashboard/recommendations', icon: Sparkles, label: 'For You', badge: null },
    { href: '/dashboard/bookings', icon: Calendar, label: 'My Bookings', badge: null },
    { href: '/dashboard/requests', icon: BookOpen, label: 'My Requests', badge: null },
    {
      href: '/dashboard/messages',
      icon: MessageSquare,
      label: 'Messages',
      badge: unreadCount || null,
    },
  ]

  // extra nav items for SPECS members only
  const specsNavItems = [
    { href: '/dashboard/sessions/new', icon: Calendar, label: 'Post a Session', badge: null },
    { href: '/dashboard/materials/upload', icon: FileText, label: 'Upload Materials', badge: null },
  ]

  const navItems = isSpecsMember
    ? [...studentNavItems, ...specsNavItems]
    : studentNavItems

  const firstName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-white flex">

      <TabTitle userId={user.id} />
      <PushNotificationPrompt />

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-64 border-r border-white/5 flex-col fixed h-full z-20">

        {/* logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Image src="/specs-logo.png" alt="SPECS logo" width={40} height={40} className="h-9 w-9 object-contain" />
            <div>
              <p className="font-black text-[14px] tracking-tight leading-none">SPECS</p>
              <p className="text-[10px] text-white/30 mt-0.5">Academic Support</p>
            </div>
          </div>
        </div>

        {/* SPECS member badge */}
        {isSpecsMember && (
          <div className="mx-3 mt-3 px-3 py-2 bg-[#E96118]/10 border border-[#E96118]/20 rounded-xl flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F58A32] animate-pulse" />
            <span className="text-[11px] text-[#F58A32] font-medium">
              SPECS {profile?.specs_role || 'Member'} ⚡
            </span>
          </div>
        )}

        {/* nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">

          {/* student section */}
          <p className="px-3 pt-1 pb-2 text-[10px] text-white/20 uppercase tracking-widest font-medium">
            Student
          </p>
          {studentNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-white/40 hover:text-white hover:bg-white/5"
            >
              <item.icon size={16} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="w-5 h-5 bg-[#E96118] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {(item.badge as number) > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          ))}

          {/* SPECS section */}
          {isSpecsMember && (
            <>
              <p className="px-3 pt-4 pb-2 text-[10px] text-[#F58A32]/60 uppercase tracking-widest font-medium">
                SPECS ⚡
              </p>
              {specsNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-[#F58A32]/60 hover:text-[#F58A32] hover:bg-[#E96118]/10"
                >
                  <item.icon size={16} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* user card */}
        <div className="px-4 py-3 mx-3 mb-2 bg-white/3 border border-white/8 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ' +
              (isSpecsMember
                ? 'bg-[#E96118] border border-[#E96118]/60 text-white'
                : 'bg-[#E96118]/20 border border-[#E96118]/30 text-[#F58A32]')
            }>
              {user.user_metadata?.full_name?.[0] || user.email?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{firstName}</p>
              <p className={'text-[10px] truncate ' + (isSpecsMember ? 'text-[#F58A32]' : 'text-white/30')}>
                {isSpecsMember ? 'SPECS Member ⚡' : 'Student'}
              </p>
            </div>
          </div>
        </div>

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
      <div className="flex-1 md:ml-64 pb-24 md:pb-0">

        {/* desktop header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/5 sticky top-0 bg-[#FFFDF8]/80 backdrop-blur-sm z-10">
          <CommandPalette />
          <div className="flex items-center gap-2">
            <NotificationPanel userId={user.id} />
            <Link
              href="/dashboard/profile"
              className={
                'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 ' +
                (isSpecsMember
                  ? 'bg-[#E96118] border border-[#E96118]/60 text-white hover:border-[#F58A32]'
                  : 'bg-[#E96118]/20 border border-[#E96118]/30 hover:border-[#E96118]/60 text-[#F58A32]')
              }
            >
              {user.user_metadata?.full_name?.[0] || user.email?.[0]}
            </Link>
          </div>
        </header>

        {/* mobile header */}
        <header className="flex md:hidden items-center justify-between px-4 py-4 border-b border-white/5 sticky top-0 bg-[#FFFDF8]/90 backdrop-blur-xl z-10">
          <div className="flex items-center gap-2">
            <Image src="/specs-logo.png" alt="SPECS logo" width={32} height={32} className="h-8 w-8 object-contain" />
            <div>
              <span className="font-black text-[14px] tracking-tight">SPECS</span>
              {isSpecsMember && <span className="text-[#F58A32] text-xs ml-1.5">⚡</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationPanel userId={user.id} />
            <Link
              href="/dashboard/profile"
              className={
                'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ' +
                (isSpecsMember
                  ? 'bg-[#E96118] text-white'
                  : 'bg-[#E96118]/20 border border-[#E96118]/30 text-[#F58A32]')
              }
            >
              {user.user_metadata?.full_name?.[0] || user.email?.[0]}
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  )
}
