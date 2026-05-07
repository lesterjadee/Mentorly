import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Star, TrendingUp, BookOpen, Zap } from 'lucide-react'
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

  const { data: topTutors } = await supabase
    .from('users')
    .select('id, full_name, school, course, trust_score, role')
    .in('role', ['tutor', 'both'])
    .neq('id', user.id)
    .gt('trust_score', 0)
    .order('trust_score', { ascending: false })
    .limit(4)

  function ServiceCard({ service }: { service: any }) {
    const isOwn = service.tutor_id === user!.id
    return (
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-[#26619C]/30 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-sm font-medium text-[#4a8fd4]">
            {service.users?.full_name?.[0] ?? '?'}
          </div>
          <div className="flex items-center gap-1.5">
            {isOwn && (
              <span className="text-[10px] text-purple-400 border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 rounded-full">
                Yours
              </span>
            )}
            <span className="text-xs text-white/30 border border-white/10 px-2 py-0.5 rounded-full">
              {service.category}
            </span>
          </div>
        </div>
        <p className="font-medium text-sm mb-1">{service.title}</p>
        <p className="text-xs text-white/30 mb-3">{service.users?.full_name} · {service.users?.school}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-yellow-400" />
            <span className="text-xs text-white/40">
              {(service.users?.trust_score ?? 0) > 0 ? service.users.trust_score : 'New'}
            </span>
          </div>
          <p className="text-sm font-semibold text-[#4a8fd4]">₱{service.price_per_hour}/hr</p>
        </div>
        {isOwn ? (
          <Link
            href={'/dashboard/services/' + service.id + '/edit'}
            className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 transition-all py-2 rounded-xl text-xs font-medium text-white/40"
          >
            Edit your listing
          </Link>
        ) : (
          <Link
            href={'/dashboard/bookings/new?service=' + service.id}
            className="block w-full text-center bg-white/5 hover:bg-[#26619C] border border-white/10 hover:border-[#26619C] transition-all py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white"
          >
            Book session
          </Link>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">For you</h1>
        <p className="text-white/40 text-sm">Personalized recommendations based on your profile and activity</p>
      </div>

      {recommendedServices.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={15} className="text-[#4a8fd4]" />
            <h2 className="text-sm font-medium text-white">Recommended for {userCourse} students</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}

      {repeatRecommendations.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={15} className="text-purple-400" />
            <h2 className="text-sm font-medium text-white">Based on your past sessions</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repeatRecommendations.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}

      {topTutors && topTutors.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Star size={15} className="text-yellow-400" />
            <h2 className="text-sm font-medium text-white">Top rated tutors</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topTutors.map((tutor: any) => (
              <div key={tutor.id} className="bg-white/3 border border-white/8 rounded-2xl p-5 text-center hover:border-yellow-500/20 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-lg font-medium text-[#4a8fd4] mx-auto mb-3">
                  {tutor.full_name?.[0]}
                </div>
                <p className="font-medium text-sm mb-0.5">{tutor.full_name}</p>
                <p className="text-xs text-white/30 mb-3">{tutor.course}</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={s <= Math.round(tutor.trust_score) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}
                    />
                  ))}
                  <span className="text-xs text-white/30 ml-1">{tutor.trust_score}</span>
                </div>
                <Link
                  href={'/dashboard/marketplace?tutor=' + tutor.id}
                  className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 transition-all py-1.5 rounded-xl text-xs font-medium text-white/50 hover:text-white"
                >
                  View services
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={15} className="text-green-400" />
          <h2 className="text-sm font-medium text-white">Popular on Mentorly</h2>
        </div>
        {popularServices && popularServices.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-10 text-center">
            <TrendingUp size={28} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No services listed yet</p>
            <p className="text-white/20 text-xs mt-1">Be the first to list a service!</p>
          </div>
        )}
      </section>

      {recommendedServices.length === 0 &&
        repeatRecommendations.length === 0 &&
        (!topTutors || topTutors.length === 0) &&
        (!popularServices || popularServices.length === 0) && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
            <Zap size={32} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-sm">No recommendations yet</p>
            <p className="text-white/20 text-xs mt-1">Book a few sessions and we'll tailor suggestions for you</p>
            <Link href="/dashboard/marketplace" className="inline-block mt-4 text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors">
              Browse marketplace
            </Link>
          </div>
        )}
    </div>
  )
}