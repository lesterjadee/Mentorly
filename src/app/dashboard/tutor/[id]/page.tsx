import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { School, BookOpen, ArrowLeft, Shield } from 'lucide-react'
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

  const { count: completedSessions } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', tutorId)
    .eq('status', 'completed')

  const totalSessions = tutor.total_sessions || completedSessions || 0
  const isOwnProfile = user.id === tutorId

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard/marketplace"
          className="text-white/30 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <p className="text-white/40 text-sm">Back to marketplace</p>
      </div>

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
                  <p className="text-sm text-white/40">{tutor.course} - {tutor.school}</p>
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

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/8">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{totalSessions}</p>
            <p className="text-xs text-white/30 mt-0.5">Sessions completed</p>
          </div>
          <div className="text-center border-l border-white/8">
            <p className="text-2xl font-black text-white">{(services || []).length}</p>
            <p className="text-xs text-white/30 mt-0.5">Active support offers</p>
          </div>
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-[#4a8fd4]" />
          <p className="text-sm font-bold">SPECS volunteer support</p>
        </div>
        <p className="text-sm text-white/35 leading-relaxed">
          SPECS members provide academic help as a service to Gordon College students. Sessions are free and centered on learning support.
        </p>
      </div>

      {services && services.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={15} className="text-[#4a8fd4]" />
            <p className="text-sm font-bold">Support offered</p>
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
                      <span className="text-xs text-green-400 border border-green-500/20 bg-green-500/10 px-2 py-1 rounded-lg">
                        Free
                      </span>
                    </div>
                  </div>
                  {!isOwnProfile && (
                    <Link
                      href={'/dashboard/bookings/new?service=' + service.id}
                      className="inline-flex items-center gap-1.5 bg-[#26619C] hover:bg-[#1e4f82] active:scale-95 transition-all px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0"
                    >
                      Book
                      <BookOpen size={11} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
