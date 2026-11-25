import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  BookOpen, Star, ChevronRight,
  GraduationCap, Sparkles, TrendingUp,
  MessageSquare, Search, Calendar,
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

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const isSpecsMember = profile?.is_specs_member || false

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

  const { count: materialsCount } = await supabase
    .from('study_materials')
    .select('*', { count: 'exact', head: true })

  const { count: sessionsCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // SPECS member stats
  const { count: mySessionsCount } = isSpecsMember
    ? await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', user.id)
        .eq('is_active', true)
    : { count: 0 }

  const { count: myMaterialsCount } = isSpecsMember
    ? await supabase
        .from('study_materials')
        .select('*', { count: 'exact', head: true })
        .eq('uploaded_by', user.id)
    : { count: 0 }

  const { count: mySupportedCount } = isSpecsMember
    ? await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', user.id)
        .in('status', ['accepted', 'completed'])
    : { count: 0 }

  // Activity data
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

  // Onboarding steps
  const studentOnboardingSteps = [
    {
      id: 'profile',
      label: 'Complete your profile',
      desc: 'Add your course and campus details',
      done: !!(profile?.bio && profile?.school && profile?.course),
      href: '/dashboard/profile',
    },
    {
      id: 'browse',
      label: 'Browse peer sessions',
      desc: 'Find free tutoring in your subjects',
      done: (bookingsCount || 0) > 0,
      href: '/dashboard/sessions',
    },
    {
      id: 'request',
      label: 'Post a help request',
      desc: 'Tell mentors what topics you need',
      done: false,
      href: '/dashboard/requests/new',
    },
  ]

  const specsOnboardingSteps = [
    {
      id: 'profile',
      label: 'Complete your profile',
      desc: 'Introduce your academic strengths',
      done: !!(profile?.bio && profile?.school && profile?.course),
      href: '/dashboard/profile',
    },
    {
      id: 'session',
      label: 'Post your first session',
      desc: 'Offer peer tutoring to students',
      done: (mySessionsCount || 0) > 0,
      href: '/dashboard/sessions/new',
    },
    {
      id: 'material',
      label: 'Upload study material',
      desc: 'Share reviewers and lecture notes',
      done: (myMaterialsCount || 0) > 0,
      href: '/dashboard/materials/upload',
    },
  ]

  const onboardingSteps = isSpecsMember
    ? specsOnboardingSteps
    : studentOnboardingSteps

  const name = profile?.full_name || user.email
  const firstName = name?.split(' ')[0] || 'there'

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening'

  const totalAlerts =
    (pendingCount || 0) +
    (unreadMessages || 0) +
    (pendingOffers || 0)

  return (
    <div className="w-full space-y-4">

      {/* Greeting & Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B716B] mb-0.5">{greeting},</p>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#20251F] leading-none">
              {firstName}
            </h1>
            <div className="flex items-center gap-1.5">
              <GraduationCap size={13} className="text-[#315B3B]" />
              <span className="text-xs text-[#6B716B] font-medium">
                {profile?.course || 'General Student'} · {profile?.school || 'Gordon College'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isSpecsMember ? (
            <div className="px-3.5 py-1.5 rounded-full border border-[#315B3B]/25 bg-[#E8F0E7] text-[#315B3B] text-xs font-bold flex items-center gap-2 shadow-[0_1px_3px_rgba(49,91,59,0.12)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#315B3B] animate-pulse" />
              <span>SPECS {profile?.specs_role || 'Mentor'} ⚡</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-full border border-[#E8E5DE] bg-white text-[#20251F] text-xs font-semibold flex items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F26A21]" />
              <span>Gordon College Learner</span>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingProgress steps={onboardingSteps} />

      {/* In-App Action Nudge */}
      <InAppNudge
        hasProfile={!!(profile?.bio && profile?.school && profile?.course)}
        hasBooking={(bookingsCount || 0) > 0}
        isSpecsMember={isSpecsMember}
        hasSession={(mySessionsCount || 0) > 0}
        hasMaterial={(myMaterialsCount || 0) > 0}
      />

      {/* Alert Banners */}
      {totalAlerts > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(pendingCount || 0) > 0 && (
            <Link
              href="/dashboard/bookings"
              className="flex items-center justify-between bg-amber-50/70 border border-amber-200/80 hover:border-amber-300 rounded-2xl p-4 transition-all group shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    {pendingCount} booking request{(pendingCount || 0) > 1 ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium">Awaiting your response</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-amber-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {(unreadMessages || 0) > 0 && (
            <Link
              href="/dashboard/messages"
              className="flex items-center justify-between bg-[#FFF0E5]/80 border border-[#F26A21]/20 hover:border-[#F26A21]/40 rounded-2xl p-4 transition-all group shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0E5] flex items-center justify-center text-[#D95416] border border-[#F26A21]/20">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#D95416]">
                    {unreadMessages} new message{(unreadMessages || 0) > 1 ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-[#6B716B] font-medium">Unread student chats</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#F26A21] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {(pendingOffers || 0) > 0 && (
            <Link
              href="/dashboard/requests"
              className="flex items-center justify-between bg-[#E8F0E7]/80 border border-[#315B3B]/20 hover:border-[#315B3B]/40 rounded-2xl p-4 transition-all group shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E7] flex items-center justify-center text-[#315B3B] border border-[#315B3B]/20">
                  <Star size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#315B3B]">
                    {pendingOffers} tutor offer{(pendingOffers || 0) > 1 ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-[#6B716B] font-medium">Ready for your review</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#315B3B] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      )}

      {/* Stat Cards Grid (BudgetMate style) */}
      {isSpecsMember ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Sessions posted"
            value={mySessionsCount ?? 0}
            sub="Active tutoring offerings"
            icon={<Calendar size={18} />}
            color="bg-[#F26A21]"
            delay={0}
          />
          <StatCard
            label="Materials shared"
            value={myMaterialsCount ?? 0}
            sub="Reviewers and lecture notes"
            icon={<FileText size={18} />}
            color="bg-[#315B3B]"
            delay={100}
          />
          <StatCard
            label="Students supported"
            value={mySupportedCount ?? 0}
            sub="Completed peer sessions"
            icon={<Shield size={18} />}
            color="bg-[#315B3B]"
            delay={200}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Sessions booked"
            value={bookingsCount ?? 0}
            sub="Your scheduled learning"
            icon={<Calendar size={18} />}
            color="bg-[#F26A21]"
            delay={0}
          />
          <StatCard
            label="Available sessions"
            value={sessionsCount ?? 0}
            sub="Free SPECS peer tutoring"
            icon={<Shield size={18} />}
            color="bg-[#315B3B]"
            delay={100}
          />
          <StatCard
            label="Study resources"
            value={materialsCount ?? 0}
            sub="Free downloads on campus"
            icon={<FileText size={18} />}
            color="bg-[#315B3B]"
            delay={200}
          />
        </div>
      )}

      {/* Activity & Quick Actions Split Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        {/* Activity Graph Card */}
        <div className="xl:col-span-5 bg-white border border-[#E8E5DE] rounded-2xl p-4 md:p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#20251F] tracking-tight">Recent Activity</h3>
              <p className="text-xs text-[#6B716B] mt-0.5">Sessions & bookings (last 14 days)</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E8F0E7] text-[#315B3B] text-xs font-bold border border-[#315B3B]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] flex-shrink-0">
              <TrendingUp size={12} />
              <span>Active Campus</span>
            </div>
          </div>
          <ActivityGraph data={activityData} />
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-7 bg-white border border-[#E8E5DE] rounded-2xl p-4 md:p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-black text-[#6B716B] uppercase tracking-widest">
              Quick Actions
            </p>
            <span className="text-[11px] text-[#939A92] font-medium">Jump right in</span>
          </div>

        {isSpecsMember ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <Link
              href="/dashboard/sessions/new"
              className="flex items-center justify-between bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3.5 hover:border-[#F26A21]/40 hover:bg-white hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-[#F26A21] group-hover:scale-105 transition-transform flex-shrink-0">
                  <Plus size={17} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#20251F] truncate">Post a session</p>
                  <p className="text-xs text-[#6B716B] mt-0.5 truncate">Offer tutoring to your peers</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#939A92] group-hover:text-[#F26A21] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>

            <Link
              href="/dashboard/materials/upload"
              className="flex items-center justify-between bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3.5 hover:border-[#315B3B]/40 hover:bg-white hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center text-[#315B3B] group-hover:scale-105 transition-transform flex-shrink-0">
                  <FileText size={17} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#20251F] truncate">Upload material</p>
                  <p className="text-xs text-[#6B716B] mt-0.5 truncate">Share notes, decks & reviewers</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#939A92] group-hover:text-[#315B3B] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>

            <Link
              href="/dashboard/sessions"
              className="flex items-center justify-between bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3.5 hover:border-[#315B3B]/40 hover:bg-white hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center text-[#315B3B] group-hover:scale-105 transition-transform flex-shrink-0">
                  <Search size={17} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#20251F] truncate">Browse all sessions</p>
                  <p className="text-xs text-[#6B716B] mt-0.5 truncate">Explore active campus tutoring</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#939A92] group-hover:text-[#315B3B] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>

            <Link
              href="/dashboard/requests/browse"
              className="flex items-center justify-between bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3.5 hover:border-[#F26A21]/40 hover:bg-white hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-[#F26A21] group-hover:scale-105 transition-transform flex-shrink-0">
                  <ClipboardList size={17} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#20251F] truncate">Student requests</p>
                  <p className="text-xs text-[#6B716B] mt-0.5 truncate">Help peers with specific topics</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#939A92] group-hover:text-[#F26A21] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <Link
              href="/dashboard/sessions"
              className="flex items-center justify-between bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3.5 hover:border-[#F26A21]/40 hover:bg-white hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-[#F26A21] group-hover:scale-105 transition-transform flex-shrink-0">
                  <Calendar size={17} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#20251F] truncate">Find a session</p>
                  <p className="text-xs text-[#6B716B] mt-0.5 truncate">Join free peer tutoring</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#939A92] group-hover:text-[#F26A21] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>

            <Link
              href="/dashboard/requests/new"
              className="flex items-center justify-between bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3.5 hover:border-[#315B3B]/40 hover:bg-white hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center text-[#315B3B] group-hover:scale-105 transition-transform flex-shrink-0">
                  <Plus size={17} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#20251F] truncate">Request academic help</p>
                  <p className="text-xs text-[#6B716B] mt-0.5 truncate">Ask mentors for custom support</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#939A92] group-hover:text-[#315B3B] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>

            <Link
              href="/dashboard/materials"
              className="flex items-center justify-between bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3.5 hover:border-[#315B3B]/40 hover:bg-white hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center text-[#315B3B] group-hover:scale-105 transition-transform flex-shrink-0">
                  <FileText size={17} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#20251F] truncate">Download materials</p>
                  <p className="text-xs text-[#6B716B] mt-0.5 truncate">Reviewers and lecture guides</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#939A92] group-hover:text-[#315B3B] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>

            <Link
              href="/dashboard/messages"
              className="flex items-center justify-between bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3.5 hover:border-[#F26A21]/40 hover:bg-white hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-[#F26A21] group-hover:scale-105 transition-transform flex-shrink-0">
                  <MessageSquare size={17} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#20251F] truncate">Messages</p>
                  <p className="text-xs text-[#6B716B] mt-0.5 truncate">
                    {unreadMessages ? `${unreadMessages} unread messages` : 'Chat with your peer tutors'}
                  </p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#939A92] group-hover:text-[#F26A21] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          </div>
        )}
        </div>
      </div>

    </div>
  )
}
