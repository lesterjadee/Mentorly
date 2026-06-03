'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, BookOpen, School, ArrowRight, ExternalLink } from 'lucide-react'
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1117] border border-white/10 rounded-3xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">

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
            <div className="bg-gradient-to-br from-[#0d1f35] to-[#0a1628] p-7 pb-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-xl font-black text-[#4a8fd4] flex-shrink-0">
                  {service.users?.full_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-black">{service.users?.full_name}</h2>
                      <div className="flex items-center gap-1.5 mt-1">
                        <School size={11} className="text-white/30" />
                        <p className="text-xs text-white/40">{service.users?.course} · {service.users?.school}</p>
                      </div>
                    </div>
                    <Link
                      href={'/dashboard/tutor/' + service.tutor_id}
                      onClick={onClose}
                      className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors flex-shrink-0 border border-white/8 px-2 py-1 rounded-lg"
                    >
                      <ExternalLink size={10} />
                      Full profile
                    </Link>
                  </div>

                  {/* quick details */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={11} className="text-[#4a8fd4]" />
                      <span className="text-xs text-white/50">Sessions:</span>
                      <span className="text-xs font-bold text-[#4a8fd4]">
                        {service.users?.total_sessions || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {service.users?.bio && (
                <p className="text-sm text-white/40 leading-relaxed mt-4 pt-4 border-t border-white/8">
                  {service.users.bio}
                </p>
              )}
            </div>

            {/* service */}
            <div className="p-6 border-t border-white/8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={14} className="text-[#4a8fd4]" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{service.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-white/30 border border-white/8 px-2 py-0.5 rounded-full">{service.category}</span>
                    <span className="text-[10px] text-white/30 border border-white/8 px-2 py-0.5 rounded-full capitalize">{service.mode}</span>
                  </div>
                </div>
              </div>

              {service.description && (
                <p className="text-sm text-white/40 leading-relaxed mb-4">{service.description}</p>
              )}

              <div className="flex items-center justify-between bg-white/3 border border-white/8 rounded-xl p-4">
                <p className="text-sm font-bold text-green-400">Free SPECS support</p>
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
