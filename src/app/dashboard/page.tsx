import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  BookOpen, Star, ChevronRight,
  GraduationCap, Sparkles, TrendingUp,
  MessageSquare, Calendar,
  FileText, Shield, ClipboardList, Plus
} from 'lucide-react'
import Link from 'next/link'
import StatCard from './components/StatCard'
import OnboardingProgress from './components/OnboardingProgress'
import ActivityGraph from './components/ActivityGraph'
import InAppNudge from './components/InAppNudge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // run ALL queries in parallel — prevents sequential timeout on Vercel
  const [
    profileResult,
    bookingsResult,
    pendingBookingsResult,
    unreadMessagesResult,
    pendingOffersResult,
    materialsCountResult,
    sessionsCountResult,
    recentBookingsResult,
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('learner_id', user.id),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('tutor_id', user.id).eq('status', 'pending'),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('is_read', false),
    supabase.from('offers').select('*', { count: 'exact', head: true }).eq('learner_id', user.id).eq('status', 'pending'),
    supabase.from('study_materials').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('bookings').select('created_at').or('learner_id.eq.' + user.id + ',tutor_id.eq.' + user.id).gte('created_at', thirtyDaysAgo.toISOString()),
  ])

  const profile = profileResult.data
  const isSpecsMember = profile?.is_specs_member || false
  const bookingsCount = bookingsResult.count || 0
  const pendingCount = pendingBookingsResult.count || 0
  const unreadMessages = unreadMessagesResult.count || 0
  const pendingOffers = pendingOffersResult.count || 0
  const materialsCount = materialsCountResult.count || 0
  const sessionsCount = sessionsCountResult.count || 0
  const recentBookings = recentBookingsResult.data || []

  // SPECS-only queries — second parallel batch
  let mySessionsCount = 0
  let myMaterialsCount = 0

  if (isSpecsMember) {
    const [specsSessionsResult, specsMaterialsResult] = await Promise.all([
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('tutor_id', user.id).eq('is_active', true),
      supabase.from('study_materials').select('*', { count: 'exact', head: true }).eq('uploaded_by', user.id),
    ])
    mySessionsCount = specsSessionsResult.count || 0
    myMaterialsCount = specsMaterialsResult.count || 0
  }

  // activity graph — last 14 days
  const activityData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toISOString().split('T')[0]
    const count = recentBookings.filter((b: any) => b.created_at.startsWith(dateStr)).length
    return { date: dateStr, count }
  })

  // onboarding steps — different for student vs SPECS
  const studentOnboardingSteps = [
    {
      id: 'profile',
      label: 'Complete your profile',
      desc: 'Add your bio and course info',
      done: !!(profile?.bio && profile?.school && profile?.course),
      href: '/dashboard/profile',
    },
    {
      id: 'browse',
      label: 'Browse SPECS sessions',
      desc: 'Find a free tutoring session',
      done: bookingsCount > 0,
      href: '/dashboard/sessions',
    },
    {
      id: 'request',
      label: 'Post a help request',
      desc: 'Tell SPECS what you need',
      done: false,
      href: '/dashboard/requests/new',
    },
  ]

  const specsOnboardingSteps = [
    {
      id: 'profile',
      label: 'Complete your profile',
      desc: 'Add your bio so students know you',
      done: !!(profile?.bio && profile?.school && profile?.course),
      href: '/dashboard/profile',
    },
    {
      id: 'session',
      label: 'Post your first session',
      desc: 'Share your knowledge with students',
      done: mySessionsCount > 0,
      href: '/dashboard/sessions/new',
    },
    {
      id: 'material',
      label: 'Upload a study material',
      desc: 'Help students even outside sessions',
      done: myMaterialsCount > 0,
      href: '/dashboard/materials/upload',
    },
  ]

  const onboardingSteps = isSpecsMember ? specsOnboardingSteps : studentOnboardingSteps

  const name = profile?.full_name || user.email
  const firstName = name?.split(' ')[0] || 'there'
  const trustScore = profile?.trust_score ?? 0

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening'

  const totalAlerts = pendingCount + unreadMessages + pendingOffers

  return (
    <div className="w-full">

      {/* greeting */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-white/30 text-sm mb-1">{greeting},</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{firstName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <GraduationCap size={13} className="text-white/20" />
            <span className="text-xs text-white/30">
              {profile?.course || 'Update your profile'} · {profile?.school || 'Gordon College'}
            </span>
          </div>
        </div>
        <div className={
          'px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ' +
          (isSpecsMember
            ? 'border-[#26619C]/40 text-[#4a8fd4] bg-[#26619C]/10'
            : 'border-white/10 text-white/40 bg-white/3')
        }>
          <div className={'w-1.5 h-1.5 rounded-full animate-pulse ' + (isSpecsMember ? 'bg-[#4a8fd4]' : 'bg-white/30')} />
          <span className="hidden sm:inline">
            {isSpecsMember
              ? 'SPECS ' + (profile?.specs_role || 'Member') + ' ⚡'
              : 'Student'}
          </span>
        </div>
      </div>

      {/* onboarding */}
      <OnboardingProgress steps={onboardingSteps} />

      {/* nudge */}
      <InAppNudge
        hasProfile={!!(profile?.bio && profile?.school && profile?.course)}
        hasBooking={bookingsCount > 0}
        isSpecsMember={isSpecsMember}
        hasSession={mySessionsCount > 0}
        hasMaterial={myMaterialsCount > 0}
      />

      {/* alert banners */}
      {totalAlerts > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {pendingCount > 0 && (
            <Link
              href="/dashboard/bookings"
              className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Calendar size={14} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-yellow-400">
                    {pendingCount} booking{pendingCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-[10px] text-white/30">awaiting your response</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-all" />
            </Link>
          )}
          {unreadMessages > 0 && (
            <Link
              href="/dashboard/messages"
              className="flex items-center justify-between bg-[#26619C]/5 border border-[#26619C]/20 hover:border-[#26619C]/40 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#26619C]/10 flex items-center justify-center">
                  <MessageSquare size={14} className="text-[#4a8fd4]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#4a8fd4]">
                    {unreadMessages} message{unreadMessages > 1 ? 's' : ''}
                  </p>
                  <p className="text-[10px] text-white/30">unread</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-all" />
            </Link>
          )}
          {pendingOffers > 0 && (
            <Link
              href="/dashboard/requests"
              className="flex items-center justify-between bg-green-500/5 border border-green-500/20 hover:border-green-500/40 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Star size={14} className="text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-400">
                    {pendingOffers} offer{pendingOffers > 1 ? 's' : ''}
                  </p>
                  <p className="text-[10px] text-white/30">waiting for you</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-all" />
            </Link>
          )}
        </div>
      )}

      {/* stat cards */}
      {isSpecsMember ? (
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          <StatCard
            label="Sessions posted"
            value={mySessionsCount}
            sub="Your SPECS sessions"
            icon={<Calendar size={15} />}
            color="bg-[#26619C]/20"
            delay={0}
          />
          <StatCard
            label="Materials shared"
            value={myMaterialsCount}
            sub="Files you uploaded"
            icon={<FileText size={15} />}
            color="bg-blue-500/20"
            delay={100}
          />
          <StatCard
            label="Trust score"
            value={trustScore > 0 ? trustScore : '—'}
            sub="Student ratings"
            icon={<Star size={15} />}
            color="bg-yellow-500/20"
            delay={200}
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          <StatCard
            label="Sessions booked"
            value={bookingsCount}
            sub="Total sessions attended"
            icon={<Calendar size={15} />}
            color="bg-[#26619C]/20"
            delay={0}
          />
          <StatCard
            label="SPECS sessions"
            value={sessionsCount}
            sub="Available to book"
            icon={<Shield size={15} />}
            color="bg-green-500/20"
            delay={100}
          />
          <StatCard
            label="Study materials"
            value={materialsCount}
            sub="Free to download"
            icon={<FileText size={15} />}
            color="bg-blue-500/20"
            delay={200}
          />
        </div>
      )}

      {/* activity graph */}
      <div className="hidden sm:block bg-white/3 border border-white/8 rounded-2xl p-5 md:p-6 mb-6">
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
      <p className="text-[10px] text-white/20 uppercase tracking-widest mb-3 font-medium">
        Quick actions
      </p>

      {isSpecsMember ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/dashboard/sessions/new"
            className="flex items-center justify-between bg-[#26619C]/5 border border-[#26619C]/15 rounded-2xl p-4 md:p-5 hover:border-[#26619C]/40 hover:bg-[#26619C]/10 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Plus size={15} className="text-[#4a8fd4]" />
              </div>
              <div>
                <p className="font-semibold text-sm">Post a session</p>
                <p className="text-xs text-white/30 mt-0.5">Share your knowledge</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-all" />
          </Link>

          <Link
            href="/dashboard/materials/upload"
            className="flex items-center justify-between bg-blue-500/3 border border-blue-500/10 rounded-2xl p-4 md:p-5 hover:border-blue-500/25 hover:bg-blue-500/8 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <FileText size={15} className="text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Upload material</p>
                <p className="text-xs text-white/30 mt-0.5">Help students study</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-all" />
          </Link>

          <Link
            href="/dashboard/sessions"
            className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-4 md:p-5 hover:border-teal-500/25 hover:bg-teal-500/3 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Calendar size={15} className="text-teal-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Browse sessions</p>
                <p className="text-xs text-white/30 mt-0.5">See all SPECS sessions</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-all" />
          </Link>

          <Link
            href="/dashboard/requests/browse"
            className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-4 md:p-5 hover:border-purple-500/25 hover:bg-purple-500/3 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <ClipboardList size={15} className="text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Student requests</p>
                <p className="text-xs text-white/30 mt-0.5">See what students need</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-all" />
          </Link>

          <Link
            href="/dashboard/messages"
            className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-4 md:p-5 hover:border-[#26619C]/25 transition-all duration-200 group sm:col-span-2"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <MessageSquare size={15} className="text-[#4a8fd4]" />
              </div>
              <div>
                <p className="font-semibold text-sm">Messages</p>
                <p className="text-xs text-white/30 mt-0.5">
                  {unreadMessages > 0
                    ? unreadMessages + ' unread message' + (unreadMessages > 1 ? 's' : '')
                    : 'Chat with students'}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-all" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/dashboard/sessions"
            className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-4 md:p-5 hover:border-[#26619C]/25 hover:bg-[#26619C]/3 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Calendar size={15} className="text-[#4a8fd4]" />
              </div>
              <div>
                <p className="font-semibold text-sm">Browse sessions</p>
                <p className="text-xs text-white/30 mt-0.5">Book a free SPECS session</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-all" />
          </Link>

          <Link
            href="/dashboard/materials"
            className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-4 md:p-5 hover:border-blue-500/25 hover:bg-blue-500/3 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <FileText size={15} className="text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Study materials</p>
                <p className="text-xs text-white/30 mt-0.5">Free reviewers and notes</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-all" />
          </Link>

          <Link
            href="/dashboard/requests/new"
            className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-4 md:p-5 hover:border-purple-500/25 hover:bg-purple-500/3 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <BookOpen size={15} className="text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Post a request</p>
                <p className="text-xs text-white/30 mt-0.5">Tell SPECS what you need</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-all" />
          </Link>

          <Link
            href="/dashboard/recommendations"
            className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-4 md:p-5 hover:border-yellow-500/25 hover:bg-yellow-500/3 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Sparkles size={15} className="text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">For you</p>
                <p className="text-xs text-white/30 mt-0.5">Personalized recommendations</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-all" />
          </Link>

          <Link
            href="/dashboard/messages"
            className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-4 md:p-5 hover:border-teal-500/25 hover:bg-teal-500/3 transition-all duration-200 group sm:col-span-2"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <MessageSquare size={15} className="text-teal-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Messages</p>
                <p className="text-xs text-white/30 mt-0.5">
                  {unreadMessages > 0
                    ? unreadMessages + ' unread message' + (unreadMessages > 1 ? 's' : '')
                    : 'Chat with SPECS tutors'}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-all" />
          </Link>
        </div>
      )}
    </div>
  )
}