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
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/marketplace"
          className="w-9 h-9 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] transition-all shadow-xs"
        >
          <ArrowLeft size={16} />
        </Link>
        <p className="text-[#6B716B] text-xs font-semibold">Back to marketplace</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <div className="lg:col-span-5 space-y-4">
      <div className="bg-gradient-to-br from-[#FFF3E9] to-[#F7FBF5] border border-[#F26A21]/20 rounded-2xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF0E5] border border-[#F26A21]/30 flex items-center justify-center text-2xl font-black text-[#F26A21] flex-shrink-0">
            {tutor.full_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-xl font-black tracking-tight text-[#20251F]">{tutor.full_name}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <School size={13} className="text-[#315B3B]" />
                  <p className="text-xs text-[#6B716B] font-medium">{tutor.course} - {tutor.school}</p>
                </div>
              </div>
              {!isOwnProfile && (
                <Link
                  href={'/dashboard/messages/' + tutorId}
                  className="flex items-center gap-2 bg-white hover:bg-[#F5F3ED] border border-[#E8E5DE] transition-all px-3.5 py-2 rounded-xl text-xs font-semibold text-[#20251F] shadow-xs flex-shrink-0"
                >
                  Message
                </Link>
              )}
            </div>

            {tutor.bio && (
              <p className="text-xs text-[#6B716B] leading-relaxed mt-4 border-t border-[#E8E5DE] pt-3">
                {tutor.bio}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-[#E8E5DE]">
          <div className="text-center">
            <p className="text-2xl font-black text-[#20251F]">{totalSessions}</p>
            <p className="text-xs text-[#6B716B] mt-0.5">Sessions completed</p>
          </div>
          <div className="text-center border-l border-[#E8E5DE]">
            <p className="text-2xl font-black text-[#20251F]">{(services || []).length}</p>
            <p className="text-xs text-[#6B716B] mt-0.5">Active support offers</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <Shield size={15} className="text-[#F26A21]" />
          <p className="text-sm font-bold text-[#20251F]">SPECS volunteer support</p>
        </div>
        <p className="text-xs text-[#6B716B] leading-relaxed">
          SPECS members provide academic help as a service to Gordon College students. Sessions are free and centered on learning support.
        </p>
      </div>
      </div>

      <div className="lg:col-span-7">
      {services && services.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={15} className="text-[#F26A21]" />
            <p className="text-sm font-bold text-[#20251F]">Support offered</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {services.map((service: any) => (
              <div
                key={service.id}
                className="bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 hover:border-[#F26A21]/30 transition-all shadow-xs group flex flex-col justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-sm text-[#20251F] mb-1">{service.title}</p>
                  {service.description && (
                    <p className="text-xs text-[#6B716B] leading-relaxed mb-3 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-[#20251F] border border-[#E8E5DE] bg-[#F5F3ED] px-2 py-0.5 rounded-lg">
                      {service.category}
                    </span>
                    <span className="text-xs text-[#6B716B] border border-[#E8E5DE] bg-[#F5F3ED] px-2 py-0.5 rounded-lg capitalize">
                      {service.mode}
                    </span>
                    <span className="text-xs text-[#315B3B] border border-[#315B3B]/20 bg-[#E8F0E7] px-2 py-0.5 rounded-lg font-semibold">
                      Free
                    </span>
                  </div>
                </div>
                {!isOwnProfile && (
                  <Link
                    href={'/dashboard/bookings/new?service=' + service.id}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#F26A21] hover:bg-[#D95416] text-white active:scale-95 transition-all px-3 py-2 rounded-xl text-xs font-bold w-full"
                  >
                    Book
                    <BookOpen size={11} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  )
}
