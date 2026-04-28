import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutDashboard, BookOpen, Briefcase, MessageSquare, Bell, LogOut, Search, Calendar } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role || 'learner'

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/marketplace', icon: Search, label: 'Marketplace' },
    { href: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
    ...(role === 'learner' || role === 'both' ? [{ href: '/dashboard/requests', icon: BookOpen, label: 'My Requests' }] : []),
    ...(role === 'tutor' || role === 'both' ? [{ href: '/dashboard/services', icon: Briefcase, label: 'My Services' }] : []),
    { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
  ]

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex">

      {/* sidebar */}
      <aside className="w-60 border-r border-white/5 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#26619C] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none"/>
                <circle cx="7" cy="7" r="2" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-[15px]">Mentorly</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all w-full">
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* main */}
      <div className="flex-1 ml-60">
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <div />
          <div className="flex items-center gap-3">
            <button className="text-white/30 hover:text-white transition-colors">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-xs font-medium text-[#4a8fd4]">
              {user.user_metadata?.full_name?.[0] || user.email?.[0]}
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}