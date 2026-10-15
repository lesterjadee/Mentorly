'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, BookOpen, School, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

type Props = {
  serviceId: string
  onClose: () => void
}

export default function TutorModal({ serviceId, onClose }: Props) {
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: svc } = await supabase
        .from('services')
        .select('*, users(id, full_name, school, course, bio, total_sessions)')
        .eq('id', serviceId)
        .single()

      if (svc) setService(svc)
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white border border-[#E8E5DE] rounded-3xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl z-10">

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#F5F3ED] hover:bg-[#E8E5DE] flex items-center justify-center text-[#20251F] transition-colors shadow-xs"
        >
          <X size={16} />
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-3 border-[#F26A21] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : service ? (
          <div className="overflow-y-auto">

            {/* Header */}
            <div className="bg-[#FFF0E5]/40 border-b border-[#E8E5DE] p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF0E5] border border-[#F26A21]/30 flex items-center justify-center text-xl font-bold text-[#F26A21] flex-shrink-0 shadow-xs">
                  {service.users?.full_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 pr-6">
                    <div>
                      <h2 className="text-xl font-bold text-[#20251F]">{service.users?.full_name}</h2>
                      <div className="flex items-center gap-1.5 mt-1">
                        <School size={13} className="text-[#315B3B]" />
                        <p className="text-xs text-[#6B716B] font-medium">{service.users?.course} · {service.users?.school}</p>
                      </div>
                    </div>
                    <Link
                      href={'/dashboard/tutor/' + service.tutor_id}
                      onClick={onClose}
                      className="flex items-center gap-1 text-xs font-semibold text-[#20251F] hover:text-[#F26A21] transition-colors flex-shrink-0 border border-[#E8E5DE] bg-white px-2.5 py-1 rounded-lg shadow-xs"
                    >
                      <ExternalLink size={12} />
                      Full profile
                    </Link>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} />
                      SPECS Volunteer
                    </span>
                    <span className="text-xs text-[#6B716B]">
                      {service.users?.total_sessions || 0} sessions completed
                    </span>
                  </div>
                </div>
              </div>

              {service.users?.bio && (
                <p className="text-xs text-[#6B716B] leading-relaxed mt-4 pt-4 border-t border-[#E8E5DE]/80 bg-white/70 p-3 rounded-xl">
                  {service.users.bio}
                </p>
              )}
            </div>

            {/* Service Body */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center flex-shrink-0 text-[#315B3B]">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-[#20251F]">{service.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-medium text-[#20251F] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-0.5 rounded-lg">
                      {service.category}
                    </span>
                    <span className="text-xs font-medium text-[#20251F] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-0.5 rounded-lg capitalize">
                      {service.mode}
                    </span>
                  </div>
                </div>
              </div>

              {service.description && (
                <div className="bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-4">
                  <p className="text-xs text-[#6B716B] leading-relaxed">{service.description}</p>
                </div>
              )}

              {/* Pricing & Booking Footer */}
              <div className="flex items-center justify-between bg-[#E8F0E7]/60 border border-[#315B3B]/20 rounded-2xl p-4">
                <div>
                  <p className="text-xs text-[#315B3B] font-bold uppercase tracking-wider">Free Academic Mentoring</p>
                  <p className="text-[11px] text-[#6B716B]">Provided via SPECS student service initiative</p>
                </div>
                <Link
                  href={'/dashboard/bookings/new?service=' + service.id}
                  onClick={onClose}
                  className="flex items-center gap-2 bg-[#F26A21] hover:bg-[#D95416] active:scale-95 text-white transition-all px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs"
                >
                  <span>Book session</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-[#6B716B] text-sm">Service not found</p>
          </div>
        )}
      </div>
    </div>
  )
}
