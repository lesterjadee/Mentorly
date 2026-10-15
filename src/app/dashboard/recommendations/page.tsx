import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, BookOpen, Zap, Sparkles, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('course, role')
    .eq('id', user.id)
    .single()

  const { data: popularServices } = await supabase
    .from('services')
    .select('*, users(full_name, school, trust_score)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const courseKeywords: Record<string, string[]> = {
    'Computer Science': ['Programming', 'Web Development', 'Data Science'],
    'Information Technology': ['Programming', 'Web Development', 'Other'],
    'Engineering': ['Mathematics', 'Physics', 'Chemistry'],
    'Business Administration': ['Accounting', 'Economics', 'Mathematics'],
    'Nursing': ['Biology', 'Chemistry', 'Science'],
    'Education': ['English', 'Filipino', 'Mathematics'],
    'Architecture': ['Mathematics', 'Physics', 'Design'],
    'Accountancy': ['Accounting', 'Economics', 'Mathematics'],
    'Psychology': ['Biology', 'English', 'Other'],
    'Mathematics': ['Mathematics', 'Physics', 'Science'],
  }

  const userCourse = profile?.course || ''
  const matchedCategories = courseKeywords[userCourse] || []

  let recommendedServices: any[] = []
  if (matchedCategories.length > 0) {
    const { data } = await supabase
      .from('services')
      .select('*, users(full_name, school, trust_score)')
      .eq('is_active', true)
      .in('category', matchedCategories)
      .limit(4)
    recommendedServices = data || []
  }

  const { data: pastBookings } = await supabase
    .from('bookings')
    .select('services(category)')
    .eq('learner_id', user.id)
    .limit(10)

  const bookedCategories = [
    ...new Set(
      (pastBookings || [])
        .map((b: any) => b.services?.category)
        .filter(Boolean)
    ),
  ]

  let repeatRecommendations: any[] = []
  if (bookedCategories.length > 0) {
    const { data } = await supabase
      .from('services')
      .select('*, users(full_name, school, trust_score)')
      .eq('is_active', true)
      .in('category', bookedCategories)
      .limit(4)
    repeatRecommendations = data || []
  }

  function ServiceCard({ service }: { service: any }) {
    const isOwn = service.tutor_id === user!.id
    return (
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-5 hover:border-[#F26A21]/30 hover:shadow-md transition-all shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-sm font-bold text-[#F26A21]">
              {service.users?.full_name?.[0] ?? '?'}
            </div>
            <div className="flex items-center gap-1.5">
              {isOwn && (
                <span className="text-[11px] font-semibold text-[#F26A21] border border-[#F26A21]/20 bg-[#FFF0E5] px-2.5 py-0.5 rounded-full">
                  Your listing
                </span>
              )}
              <span className="text-xs text-[#20251F] font-medium border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-0.5 rounded-full">
                {service.category}
              </span>
            </div>
          </div>
          <h3 className="font-semibold text-sm text-[#20251F] mb-1 line-clamp-1">{service.title}</h3>
          <p className="text-xs text-[#6B716B] mb-3">{service.users?.full_name} · {service.users?.school}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 pt-3 border-t border-[#E8E5DE]/60">
            <span className="text-xs text-[#6B716B] flex items-center gap-1">
              <ShieldCheck size={13} className="text-[#315B3B]" />
              SPECS Peer
            </span>
            <span className="text-xs font-bold text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 px-2.5 py-0.5 rounded-full">
              Free Session
            </span>
          </div>

          {isOwn ? (
            <Link
              href={'/dashboard/services/' + service.id + '/edit'}
              className="block w-full text-center bg-[#F5F3ED] hover:bg-[#E8E5DE] border border-[#E8E5DE] transition-all py-2 rounded-xl text-xs font-semibold text-[#20251F]"
            >
              Edit your listing
            </Link>
          ) : (
            <Link
              href={'/dashboard/bookings/new?service=' + service.id}
              className="block w-full text-center bg-[#F26A21] hover:bg-[#D95416] text-white transition-all py-2 rounded-xl text-xs font-semibold shadow-xs"
            >
              Book free session
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E7] text-[#315B3B] text-xs font-semibold mb-1">
          <Sparkles size={12} />
          Tailored For You
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">Recommended For You</h1>
        <p className="text-[#6B716B] text-sm mt-0.5">Personalized peer tutoring and study services based on your major and activity</p>
      </div>

      {recommendedServices.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#FFF0E5] text-[#F26A21] flex items-center justify-center">
              <Zap size={15} />
            </div>
            <h2 className="text-sm font-bold text-[#20251F]">Recommended for {userCourse} Students</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}

      {repeatRecommendations.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#E8F0E7] text-[#315B3B] flex items-center justify-center">
              <BookOpen size={15} />
            </div>
            <h2 className="text-sm font-bold text-[#20251F]">Based on Your Past Subjects</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {repeatRecommendations.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#E8F0E7] text-[#315B3B] flex items-center justify-center">
            <TrendingUp size={15} />
          </div>
          <h2 className="text-sm font-bold text-[#20251F]">Popular on Mentorly</h2>
        </div>
        {popularServices && popularServices.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-10 text-center shadow-xs">
            <TrendingUp size={28} className="text-[#6B716B]/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#20251F]">No services listed yet</p>
            <p className="text-xs text-[#6B716B] mt-1">Be the first to list a peer tutoring service!</p>
          </div>
        )}
      </section>

      {recommendedServices.length === 0 &&
        repeatRecommendations.length === 0 &&
        (!popularServices || popularServices.length === 0) && (
          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-12 text-center shadow-xs">
            <Zap size={32} className="text-[#F26A21] mx-auto mb-4" />
            <p className="text-base font-semibold text-[#20251F]">No recommendations yet</p>
            <p className="text-xs text-[#6B716B] mt-1 max-w-sm mx-auto">
              Book a few peer sessions or browse subjects to tailor suggestions for your major.
            </p>
            <Link
              href="/dashboard/marketplace"
              className="inline-block mt-4 bg-[#F26A21] hover:bg-[#D95416] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              Browse marketplace
            </Link>
          </div>
        )}
    </div>
  )
}
