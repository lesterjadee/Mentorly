'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'

export default function NewReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking')
  const tutorId = searchParams.get('tutor')

  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const labels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very good',
    5: 'Excellent',
  }

  async function handleSubmit() {
    if (rating === 0) {
      setError('Please select a rating.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: reviewError } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      reviewer_id: user.id,
      reviewee_id: tutorId,
      rating,
      comment,
    })

    if (reviewError) {
      setError(reviewError.message)
      setLoading(false)
      return
    }

    // recalculate trust score
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', tutorId)

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
      await supabase
        .from('users')
        .update({ trust_score: Math.round(avg * 100) / 100 })
        .eq('id', tutorId)
    }

    router.push('/dashboard/bookings?reviewed=true')
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/bookings" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Leave a review</h1>
          <p className="text-white/40 text-sm mt-1">How was your session?</p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-6">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* star rating */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-4 block">
            Your rating
          </label>
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={
                    star <= (hovered || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-white/10'
                  }
                />
              </button>
            ))}
          </div>
          {(hovered || rating) > 0 && (
            <p className="text-sm text-white/50">
              {labels[hovered || rating]}
            </p>
          )}
        </div>

        {/* comment */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
            Comment — optional
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your experience with this tutor..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium"
        >
          {loading ? 'Submitting...' : 'Submit review'}
        </button>
      </div>
    </div>
  )
}