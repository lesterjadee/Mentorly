'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Star, BookOpen, School, Award, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type Props = {
  serviceId: string
  onClose: () => void
}

export default function TutorModal({ serviceId, onClose }: Props) {
  const [service, setService] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: svc } = await supabase
        .from('services')
        .select('*, users(id, full_name, school, course, trust_score, bio)')
        .eq('id', serviceId)
        .single()

      if (svc) {
        setService(svc)
        const { data: rvws } = await supabase
          .from('reviews')
          .select('*, reviewer:users!reviews_reviewer_id_fkey(full_name)')
          .eq('reviewee_id', svc.tutor_id)
          .order('created_at', { ascending: false })
          .limit(5)
        setReviews(rvws || [])
      }
      setLoading(false)
    }
    load()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [serviceId])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1117] border border-white/10 rounded-3xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">

        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <X size={15} />
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-5 h-5 border-2 border-[#26619C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : service ? (
          <div className="overflow-y-auto">

            {/* header */}
            <div className="bg-gradient-to-br from-[#0d1f35] to-[#0a1628] p-8 pb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-2xl font-black text-[#4a8fd4] flex-shrink-0">
                  {service.users?.full_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black tracking-tight">{service.users?.full_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <School size={12} className="text-white/30" />
                    <p className="text-xs text-white/40">{service.users?.course} · {service.users?.school}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    {(service.users?.trust_score || 0) > 0 && (
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={s <= Math.round(service.users.trust_score) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}
                          />
                        ))}
                        <span className="text-xs text-white/50 ml-1">{service.users.trust_score}</span>
                      </div>
                    )}
                    <span className="text-xs text-white/20 border border-white/10 px-2 py-0.5 rounded-full">
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {service.users?.bio && (
                <p className="text-sm text-white/40 leading-relaxed mt-4 border-t border-white/8 pt-4">
                  {service.users.bio}
                </p>
              )}
            </div>

            {/* service info */}
            <div className="p-6 border-t border-white/8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={15} className="text-[#4a8fd4]" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{service.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/30 border border-white/8 px-2 py-0.5 rounded-full">{service.category}</span>
                    <span className="text-xs text-white/30 border border-white/8 px-2 py-0.5 rounded-full capitalize">{service.mode}</span>
                  </div>
                </div>
              </div>

              {service.description && (
                <p className="text-sm text-white/40 leading-relaxed mb-4">{service.description}</p>
              )}

              <div className="flex items-center justify-between bg-white/3 border border-white/8 rounded-xl p-4">
                <div>
                  <p className="text-xs text-white/30">Rate</p>
                  <p className="text-2xl font-black text-[#4a8fd4]">₱{service.price_per_hour}<span className="text-sm font-normal text-white/30">/hr</span></p>
                </div>
                <Link
                  href={'/dashboard/bookings/new?service=' + service.id}
                  onClick={onClose}
                  className="flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] active:scale-95 transition-all px-5 py-3 rounded-xl text-sm font-bold"
                >
                  Book now
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* reviews */}
            {reviews.length > 0 && (
              <div className="px-6 pb-6">
                <p className="text-xs text-white/20 uppercase tracking-widest mb-3 font-medium">Reviews</p>
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white/3 border border-white/8 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-white/60">{review.reviewer?.full_name}</p>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star
                              key={s}
                              size={10}
                              className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-white/30 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-white/30 text-sm">Service not found</p>
          </div>
        )}
      </div>
    </div>
  )
}