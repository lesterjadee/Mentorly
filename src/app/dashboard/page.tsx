import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Briefcase, Star, Bell, Search, ChevronRight, GraduationCap } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = user.user_metadata?.full_name || user.email
  const school = user.user_metadata?.school || 'Your university'
  const course = user.user_metadata?.course || 'Your course'
  const role = user.user_metadata?.role || 'both'

  const firstName = name?.split(' ')[0]

  return (
    <main className="min-h-screen bg-[#080C14] text-white">

      {/* nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#26619C] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-semibold text-[15px]">Mentorly</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-white/30 hover:text-white transition-colors">
            <Bell size={18} />
          </button>
          <button className="text-white/30 hover:text-white transition-colors">
            <Search size={18} />
          </button>
          <div className="w-px h-5 bg-white/10" />
          <form action="/auth/signout" method="post">
            <button className="text-sm text-white/40 hover:text-white transition-colors">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-white/40 text-sm mb-1">Good day,</p>
            <h1 className="text-3xl font-bold">{firstName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <GraduationCap size={13} className="text-white/30" />
              <span className="text-xs text-white/30">{course} · {school}</span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 ${
            role === 'tutor' ? 'border-[#26619C]/40 text-[#4a8fd4] bg-[#26619C]/10' :
            role === 'learner' ? 'border-teal-500/30 text-teal-400 bg-teal-500/10' :
            'border-purple-500/30 text-purple-400 bg-purple-500/10'
          }`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            {role === 'both' ? 'Tutor & Learner' : role === 'tutor' ? 'Tutor' : 'Learner'}
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Sessions booked', value: '0', sub: 'No sessions yet' },
            { icon: Briefcase, label: 'Services listed', value: '0', sub: 'Start offering help' },
            { icon: Star, label: 'Trust score', value: '—', sub: 'Complete sessions to earn' },
          ].map((card) => (
            <div key={card.label} className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-white/40 uppercase tracking-wider">{card.label}</p>
                <card.icon size={14} className="text-white/20" />
              </div>
              <p className="text-3xl font-bold mb-1">{card.value}</p>
              <p className="text-xs text-white/30">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* dual role panels */}
        {(role === 'learner' || role === 'both') && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-4 group hover:border-teal-500/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <BookOpen size={16} className="text-teal-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Find a tutor</p>
                  <p className="text-xs text-white/30 mt-0.5">Browse services and book a session</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
          </div>
        )}

        {(role === 'tutor' || role === 'both') && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 group hover:border-[#26619C]/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center">
                  <Briefcase size={16} className="text-[#4a8fd4]" />
                </div>
                <div>
                  <p className="font-medium text-sm">Offer a service</p>
                  <p className="text-xs text-white/30 mt-0.5">List your skills and start earning</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
          </div>
        )}

        <div className="mt-6 bg-white/3 border border-white/8 rounded-2xl p-6 text-center">
          <p className="text-white/30 text-sm">More features arriving in the next sprints</p>
        </div>

      </div>
    </main>
  )
}