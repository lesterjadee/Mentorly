import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  BookOpen, Briefcase, Star, ChevronRight,
  GraduationCap, Sparkles, TrendingUp, ArrowLeftRight,
  MessageSquare, Search, Calendar
} from 'lucide-react'
import Link from 'next/link'
import StatCard from './components/StatCard'
import OnboardingProgress from './components/OnboardingProgress'
import ActivityGraph from './components/ActivityGraph'

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

  const { count: unreadMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  const { count: pendingOffers } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', user.id)
    .eq('status', 'pending')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('created_at')
    .or('learner_id.eq.' + user.id + ',tutor_id.eq.' + user.id)
    .gte('created_at', thirtyDaysAgo.toISOString())

  const activityData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toISOString().split('T')[0]
    const count = (recentBookings || []).filter((b) =>
      b.created_at.startsWith(dateStr)
    ).length
    return { date: dateStr, count }
  })

  const onboardingSteps = [
    {
      id: 'profile',
      label: 'Complete your profile',
      desc: 'Add your bio to get 2x more offers',
      done: !!(profile?.bio && profile?.school && profile?.course),
      href: '/dashboard/profile',
    },
    {
      id: 'service',
      label: 'List your first service',
      desc: 'Start earning by sharing your knowledge',
      done: (servicesCount || 0) > 0,
      href: '/dashboard/services/new',
    },
    {
      id: 'booking',
      label: 'Book your first session',
      desc: 'Find a tutor and schedule a session',
      done: (bookingsCount || 0) > 0,
      href: '/dashboard/marketplace',
    },
  ]

  const name = profile?.full_name || user.email
  const firstName = name?.split(' ')[0]
  const role = profile?.role || 'both'

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening'

  const totalAlerts = (pendingCount || 0) + (unreadMessages || 0) + (pendingOffers || 0)

  return (
    <div className="w-full">

      {/* greeting */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-white/30 text-sm mb-1">{greeting},</p>
          <h1 className="text-3xl font-black tracking-tight">{firstName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <GraduationCap size={13} className="text-white/20" />
            <span className="text-xs text-white/30">
              {profile?.course || 'Update your profile'} · {profile?.school || ''}
            </span>
          </div>
        </div>
        <div className={
          'px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ' +
          (role === 'tutor' ? 'border-[#26619C]/40 text-[#4a8fd4] bg-[#26619C]/10' :
          role === 'learner' ? 'border-teal-500/30 text-teal-400 bg-teal-500/10' :
          'border-purple-500/30 text-purple-400 bg-purple-500/10')
        }>
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {role === 'both' ? 'Tutor & Learner' : role === 'tutor' ? 'Tutor' : 'Learner'}
        </div>
      </div>

      {/* onboarding progress */}
      <OnboardingProgress steps={onboardingSteps} />

      {/* alerts banner */}
      {totalAlerts > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {(pendingCount || 0) > 0 && (
            <Link
              href="/dashboard/bookings"
              className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Calendar size={14} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-yellow-400">{pendingCount} booking{(pendingCount || 0) > 1 ? 's' : ''}</p>
                  <p className="text-[10px] text-white/30">awaiting your response</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}
          {(unreadMessages || 0) > 0 && (
            <Link
              href="/dashboard/messages"
              className="flex items-center justify-between bg-[#26619C]/5 border border-[#26619C]/20 hover:border-[#26619C]/40 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#26619C]/10 flex items-center justify-center">
                  <MessageSquare size={14} className="text-[#4a8fd4]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#4a8fd4]">{unreadMessages} message{(unreadMessages || 0) > 1 ? 's' : ''}</p>
                  <p className="text-[10px] text-white/30">unread</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}
          {(pendingOffers || 0) > 0 && (
            <Link
              href="/dashboard/requests"
              className="flex items-center justify-between bg-green-500/5 border border-green-500/20 hover:border-green-500/40 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Star size={14} className="text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-400">{pendingOffers} offer{(pendingOffers || 0) > 1 ? 's' : ''}</p>
                  <p className="text-[10px] text-white/30">waiting for you</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}
        </div>
      )}

      {/* stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Sessions booked"
          value={bookingsCount ?? 0}
          sub="Total sessions as learner"
          icon={<BookOpen size={15} />}
          color="bg-[#26619C]/20"
          delay={0}
        />
        <StatCard
          label="Services listed"
          value={servicesCount ?? 0}
          sub="Active tutoring services"
          icon={<Briefcase size={15} />}
          color="bg-purple-500/20"
          delay={100}
        />
        <StatCard
          label="Trust score"
          value={profile?.trust_score > 0 ? profile.trust_score : '—'}
          sub="Based on completed sessions"
          icon={<Star size={15} />}
          color="bg-yellow-500/20"
          delay={200}
        />
      </div>

      {/* activity graph */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold">Activity</p>
            <p className="text-xs text-white/30 mt-0.5">Sessions in the last 14 days</p>
          </div>
          <TrendingUp size={15} className="text-white/20" />
        </div>
        <ActivityGraph data={activityData} />
      </div>

      {/* quick actions */}
      <p className="text-[10px] text-white/20 uppercase tracking-widest mb-3 font-medium">Quick actions</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        <Link
          href="/dashboard/marketplace"
          className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-teal-500/25 hover:bg-teal-500/3 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Search size={16} className="text-teal-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Browse tutors</p>
              <p className="text-xs text-white/30 mt-0.5">Find help for your subjects</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/dashboard/services/new"
          className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-[#26619C]/25 hover:bg-[#26619C]/3 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Briefcase size={16} className="text-[#4a8fd4]" />
            </div>
            <div>
              <p className="font-semibold text-sm">List a service</p>
              <p className="text-xs text-white/30 mt-0.5">Start earning by helping others</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/dashboard/requests/new"
          className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-purple-500/25 hover:bg-purple-500/3 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <BookOpen size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Post a request</p>
              <p className="text-xs text-white/30 mt-0.5">Let tutors come to you</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/dashboard/trades"
          className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-green-500/25 hover:bg-green-500/3 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <ArrowLeftRight size={16} className="text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Skill Swap</p>
              <p className="text-xs text-white/30 mt-0.5">Trade subjects — no fees</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/dashboard/recommendations"
          className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-yellow-500/25 hover:bg-yellow-500/3 transition-all duration-200 group md:col-span-2"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Sparkles size={16} className="text-yellow-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">For you</p>
              <p className="text-xs text-white/30 mt-0.5">Personalized tutor recommendations based on your course</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  )
}