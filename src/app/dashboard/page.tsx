import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Briefcase, Star, ChevronRight, GraduationCap, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: servicesCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', user.id)

  const { count: bookingsCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', user.id)

  const { count: pendingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', user.id)
    .eq('status', 'pending')

  const name = profile?.full_name || user.email
  const firstName = name?.split(' ')[0]
  const role = profile?.role || 'learner'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="w-full">

      {/* header */}
      <div className="flex items-start justify-between mb-8 animate-fade-in-up">
        <div>
          <p className="text-white/40 text-sm mb-1">{greeting},</p>
          <h1 className="text-3xl font-bold">{firstName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <GraduationCap size={13} className="text-white/30" />
            <span className="text-xs text-white/30">
              {profile?.course} · {profile?.school}
            </span>
          </div>
        </div>
        <div className={
          'px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 ' +
          (role === 'tutor' ? 'border-[#26619C]/40 text-[#4a8fd4] bg-[#26619C]/10' :
          role === 'learner' ? 'border-teal-500/30 text-teal-400 bg-teal-500/10' :
          'border-purple-500/30 text-purple-400 bg-purple-500/10')
        }>
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {role === 'both' ? 'Tutor & Learner' : role === 'tutor' ? 'Tutor' : 'Learner'}
        </div>
      </div>

      {/* pending alert */}
      {pendingCount && pendingCount > 0 ? (
        <Link
          href="/dashboard/bookings"
          className="flex items-center justify-between glass border-[#26619C]/20 rounded-2xl p-4 mb-6 hover:border-[#26619C]/40 transition-all duration-300 group animate-fade-in-up delay-75"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#26619C]/20 flex items-center justify-center animate-pulse">
              <TrendingUp size={14} className="text-[#4a8fd4]" />
            </div>
            <p className="text-sm">
              You have <span className="text-[#4a8fd4] font-medium">{pendingCount} pending booking {pendingCount === 1 ? 'request' : 'requests'}</span> waiting
            </p>
          </div>
          <ChevronRight size={15} className="text-white/20 group-hover:text-white/50 transition-colors" />
        </Link>
      ) : null}

      {/* stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: BookOpen, label: 'Sessions booked', value: bookingsCount ?? 0, sub: 'Total bookings made', delay: 'delay-75' },
          { icon: Briefcase, label: 'Services listed', value: servicesCount ?? 0, sub: 'Active services', delay: 'delay-150' },
          { icon: Star, label: 'Trust score', value: profile?.trust_score > 0 ? profile.trust_score : '—', sub: 'Based on reviews', delay: 'delay-225' },
        ].map((card) => (
          <div
            key={card.label}
            className={'glass rounded-2xl p-6 hover:border-white/15 transition-all duration-300 group animate-fade-in-up ' + card.delay}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">{card.label}</p>
              <card.icon size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
            <p className="text-3xl font-bold mb-1">{card.value}</p>
            <p className="text-xs text-white/30">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* quick actions — 2 column grid */}
      <p className="text-xs text-white/30 uppercase tracking-wider mb-4 animate-fade-in-up delay-300">Quick actions</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in-up delay-300">

        {(role === 'learner' || role === 'both') && (
          <Link href="/dashboard/marketplace" className="flex items-center justify-between glass rounded-2xl p-5 hover:border-teal-500/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <BookOpen size={16} className="text-teal-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Browse tutors</p>
                <p className="text-xs text-white/30 mt-0.5">Find help for your subjects</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        )}

        {(role === 'tutor' || role === 'both') && (
          <Link href="/dashboard/services/new" className="flex items-center justify-between glass rounded-2xl p-5 hover:border-[#26619C]/30 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Briefcase size={16} className="text-[#4a8fd4]" />
              </div>
              <div>
                <p className="font-medium text-sm">List a service</p>
                <p className="text-xs text-white/30 mt-0.5">Start earning by helping others</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        )}

        {(role === 'learner' || role === 'both') && (
          <Link href="/dashboard/requests/new" className="flex items-center justify-between glass rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <BookOpen size={16} className="text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Post a request</p>
                <p className="text-xs text-white/30 mt-0.5">Tell tutors what you need help with</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        )}

        <Link href="/dashboard/recommendations" className="flex items-center justify-between glass rounded-2xl p-5 hover:border-yellow-500/20 transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Sparkles size={16} className="text-yellow-400" />
            </div>
            <div>
              <p className="font-medium text-sm">For you</p>
              <p className="text-xs text-white/30 mt-0.5">Personalized tutor recommendations</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-200" />
        </Link>

      </div>
    </div>
  )
}