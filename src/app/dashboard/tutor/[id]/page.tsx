import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Star, School, BookOpen, Calendar, ArrowLeft, Award, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function TutorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id: tutorId } = await params

  const { data: tutor } = await supabase
    .from('users')
    .select('*')
    .eq('id', tutorId)
    .single()

  if (!tutor) redirect('/dashboard/marketplace')

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tutor_id', tutorId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:users!reviews_reviewer_id_fkey(full_name, course)')
    .eq('reviewee_id', tutorId)
    .order('created_at', { ascending: false })

  const { count: completedSessions } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', tutorId)
    .eq('status', 'completed')

  const mentorScore = tutor.mentor_score || tutor.trust_score || 0
  const learnerScore = tutor.learner_score || 0
  const totalSessions = tutor.total_sessions || completedSessions || 0

  const mentorReviews = (reviews || []).filter((r: any) => r.reviewer_role === 'learner')
  const learnerReviews = (reviews || []).filter((r: any) => r.reviewer_role === 'tutor')

  function StarRating({ score, size = 14 }: { score: number; size?: number }) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={size}
            className={s <= Math.round(score) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}
          />
        ))}
      </div>
    )
  }

  function ScoreBar({ score }: { score: number }) {
    const pct = (score / 5) * 100
    return (
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex-1">
        <div
          className="h-full bg-gradient-to-r from-[#26619C] to-[#4a8fd4] rounded-full transition-all duration-700"
          style={{ width: pct + '%' }}
        />
      </div>
    )
  }

  const isOwnProfile = user.id === tutorId

  return (
    <div className="max-w-3xl">

      {/* back */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard/marketplace"
          className="text-white/30 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <p className="text-white/40 text-sm">Back to marketplace</p>
      </div>

      {/* profile hero */}
      <div className="bg-gradient-to-br from-[#0d1f35] to-[#0a1628] border border-[#26619C]/20 rounded-3xl p-8 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-3xl font-black text-[#4a8fd4] flex-shrink-0">
            {tutor.full_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-black tracking-tight">{tutor.full_name}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <School size={13} className="text-white/30" />
                  <p className="text-sm text-white/40">{tutor.course} · {tutor.school}</p>
                </div>
              </div>
              {!isOwnProfile && (
                <Link
                  href={'/dashboard/messages/' + tutorId}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white flex-shrink-0"
                >
                  Message
                </Link>
              )}
            </div>

            {tutor.bio && (
              <p className="text-sm text-white/40 leading-relaxed mt-4 border-t border-white/8 pt-4">
                {tutor.bio}
              </p>
            )}
          </div>
        </div>

        {/* stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/8">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{totalSessions}</p>
            <p className="text-xs text-white/30 mt-0.5">Sessions completed</p>
          </div>
          <div className="text-center border-x border-white/8">
            <p className="text-2xl font-black text-white">{(services || []).length}</p>
            <p className="text-xs text-white/30 mt-0.5">Active services</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{(reviews || []).length}</p>
            <p className="text-xs text-white/30 mt-0.5">Total reviews</p>
          </div>
        </div>
      </div>

      {/* dual trust score */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Award size={16} className="text-yellow-400" />
          <p className="text-sm font-bold">Trust scores</p>
          <span className="text-[10px] text-white/20 border border-white/8 px-2 py-0.5 rounded-full ml-1">
            Verified by Mentorly
          </span>
        </div>

        <div className="space-y-4">

          {/* mentor score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold">Mentor score</p>
                <p className="text-xs text-white/30">Rated by students after sessions</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-yellow-400">
                  {mentorScore > 0 ? mentorScore : '—'}
                </p>
                <p className="text-[10px] text-white/20">out of 5.00</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StarRating score={mentorScore} />
              <ScoreBar score={mentorScore} />
              <span className="text-xs text-white/30 flex-shrink-0">
                {mentorReviews.length} review{mentorReviews.length !== 1 ? 's' : ''}
              </span>
            </div>
            {mentorScore === 0 && (
              <p className="text-xs text-white/20 mt-1.5">No mentor reviews yet</p>
            )}
          </div>

          <div className="border-t border-white/5" />

          {/* learner score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold">Learner score</p>
                <p className="text-xs text-white/30">Rated by tutors after sessions</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#4a8fd4]">
                  {learnerScore > 0 ? learnerScore : '—'}
                </p>
                <p className="text-[10px] text-white/20">out of 5.00</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StarRating score={learnerScore} />
              <ScoreBar score={learnerScore} />
              <span className="text-xs text-white/30 flex-shrink-0">
                {learnerReviews.length} review{learnerReviews.length !== 1 ? 's' : ''}
              </span>
            </div>
            {learnerScore === 0 && (
              <p className="text-xs text-white/20 mt-1.5">No learner reviews yet</p>
            )}
          </div>
        </div>
      </div>

      {/* services */}
      {services && services.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={15} className="text-[#4a8fd4]" />
            <p className="text-sm font-bold">Services offered</p>
          </div>
          <div className="space-y-3">
            {services.map((service: any) => (
              <div
                key={service.id}
                className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-[#26619C]/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">{service.title}</p>
                    {service.description && (
                      <p className="text-xs text-white/30 leading-relaxed mb-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg">
                        {service.category}
                      </span>
                      <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg capitalize">
                        {service.mode}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-black text-[#4a8fd4]">
                      ₱{service.price_per_hour}
                      <span className="text-xs font-normal text-white/30">/hr</span>
                    </p>
                    {!isOwnProfile && (
                      <Link
                        href={'/dashboard/bookings/new?service=' + service.id}
                        className="inline-flex items-center gap-1.5 mt-2 bg-[#26619C] hover:bg-[#1e4f82] active:scale-95 transition-all px-3 py-1.5 rounded-lg text-xs font-bold"
                      >
                        Book
                        <BookOpen size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* reviews */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Star size={15} className="text-yellow-400" />
          <p className="text-sm font-bold">All reviews</p>
          <span className="text-xs text-white/30">({(reviews || []).length})</span>
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review: any) => (
              <div key={review.id} className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 flex-shrink-0">
                      {review.reviewer?.full_name?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/70">
                        {review.reviewer?.full_name}
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {review.reviewer?.course}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StarRating score={review.rating} size={12} />
                    <span className={
                      'text-[10px] px-2 py-0.5 rounded-full border ' +
                      (review.reviewer_role === 'learner'
                        ? 'text-[#4a8fd4] border-[#26619C]/20 bg-[#26619C]/10'
                        : 'text-teal-400 border-teal-500/20 bg-teal-500/10')
                    }>
                      {review.reviewer_role === 'learner' ? 'Student review' : 'Tutor review'}
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-white/40 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-10 text-center">
            <Star size={28} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No reviews yet</p>
            <p className="text-white/20 text-xs mt-1">
              {isOwnProfile
                ? 'Complete sessions to earn your first review'
                : 'Be the first to review this tutor'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}