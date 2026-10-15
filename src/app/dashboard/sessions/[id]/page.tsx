import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Clock, Shield, Users,
  FileText, Download, BookOpen, MessageSquare, CheckCircle2
} from 'lucide-react'

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const { data: session } = await supabase
    .from('services')
    .select(`
      *,
      tutor:users!services_tutor_id_fkey(id, full_name, course, school, is_specs_member, specs_role, trust_score, bio)
    `)
    .eq('id', id)
    .single()

  if (!session) redirect('/dashboard/sessions')

  const { data: materials } = await supabase
    .from('study_materials')
    .select('*')
    .eq('session_id', id)
    .order('created_at', { ascending: false })

  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('service_id', id)
    .eq('learner_id', user.id)
    .single()

  const isOwn = session.tutor_id === user.id

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
  }

  function formatEndTime(startTime: string, hours: number) {
    if (!startTime || !hours) return ''
    const [h, m] = startTime.split(':').map(Number)
    const totalMins = h * 60 + m + hours * 60
    const endH = Math.floor(totalMins / 60) % 24
    const endM = totalMins % 60
    const period = (t: number) => t >= 12 ? 'PM' : 'AM'
    const fmt = (t: number) => t % 12 === 0 ? 12 : t % 12
    return fmt(h) + ':' + String(m).padStart(2,'0') + ' ' + period(h) + ' – ' + fmt(endH) + ':' + String(endM).padStart(2,'0') + ' ' + period(endH)
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const typeLabel: Record<string, string> = {
    tutoring: 'Tutoring Session', workshop: 'Workshop',
    review: 'Review Session', consultation: 'Consultation',
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/sessions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B716B] hover:text-[#20251F] transition-colors bg-white px-3 py-1.5 rounded-xl border border-[#E8E5DE] shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>Back to all sessions</span>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-5">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-[#FFF8F1] via-white to-[#F3F7F2] border border-[#E8E5DE] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-bold text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 px-3 py-1 rounded-full">
                FREE PEER TUTORING
              </span>
              <span className="text-xs font-semibold text-[#D95416] bg-[#FFF0E5] border border-[#F26A21]/20 px-2.5 py-1 rounded-full">
                {typeLabel[session.session_type] || 'Tutoring'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#20251F] tracking-tight mb-2">
              {session.title}
            </h1>
            {session.description && (
              <p className="text-[#6B716B] text-sm leading-relaxed">{session.description}</p>
            )}
          </div>

          {/* Tutor Info Card */}
          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-bold text-[#939A92] uppercase tracking-wider mb-4">
              Your SPECS Tutor
            </p>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-base font-extrabold text-[#D95416] flex-shrink-0 shadow-2xs">
                {session.tutor?.full_name?.[0] || 'T'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-base text-[#20251F] truncate">{session.tutor?.full_name}</p>
                  <div className="flex items-center gap-1 bg-[#E8F0E7] text-[#315B3B] px-2 py-0.5 rounded-full border border-[#315B3B]/20 flex-shrink-0">
                    <Shield size={11} />
                    <span className="text-[10px] font-bold">
                      SPECS {session.tutor?.specs_role || 'Mentor'}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-medium text-[#6B716B]">{session.tutor?.course} · {session.tutor?.school}</p>
                {session.tutor?.bio && (
                  <p className="text-xs text-[#6B716B] mt-2 leading-relaxed bg-[#FFFCF7] p-3 rounded-xl border border-[#E8E5DE]">
                    {session.tutor.bio}
                  </p>
                )}
              </div>
            </div>
            {!isOwn && (
              <Link
                href={'/dashboard/messages/' + session.tutor_id}
                className="flex items-center justify-center gap-2 mt-4 bg-[#F5F3ED] hover:bg-[#E8E5DE] border border-[#E8E5DE] transition-colors py-2 rounded-xl text-xs font-bold text-[#20251F]"
              >
                <MessageSquare size={14} className="text-[#F26A21]" />
                <span>Message {session.tutor?.full_name?.split(' ')[0] || 'Tutor'}</span>
              </Link>
            )}
          </div>

          {/* Session Details */}
          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-bold text-[#939A92] uppercase tracking-wider mb-4">
              Session Specifications
            </p>
            <div className="space-y-3 divide-y divide-[#E8E5DE]">
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#6B716B]">Subject Field</span>
                <span className="text-xs font-bold text-[#20251F]">{session.category}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-[#6B716B]">Session Format</span>
                <span className="text-xs font-bold text-[#20251F] capitalize">{session.mode}</span>
              </div>
              {session.max_participants && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs text-[#6B716B]">Max Capacity</span>
                  <span className="text-xs font-bold text-[#20251F] flex items-center gap-1.5">
                    <Users size={13} className="text-[#315B3B]" /> {session.max_participants} learners
                  </span>
                </div>
              )}
              {session.start_date && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs text-[#6B716B] flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#315B3B]" /> Scheduled Date
                  </span>
                  <span className="text-xs font-bold text-[#20251F]">
                    {formatDate(session.start_date)}
                    {session.end_date && session.end_date !== session.start_date
                      ? ' → ' + formatDate(session.end_date)
                      : ''}
                  </span>
                </div>
              )}
              {session.daily_start_time && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs text-[#6B716B] flex items-center gap-1.5">
                    <Clock size={13} className="text-[#F26A21]" /> Time Window
                  </span>
                  <span className="text-xs font-bold text-[#20251F]">
                    {formatEndTime(session.daily_start_time, session.hours_per_day || 1)}
                  </span>
                </div>
              )}
              <div className="pt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-[#6B716B]">Tutoring Fee</span>
                <span className="text-sm font-extrabold text-[#315B3B] bg-[#E8F0E7] px-2.5 py-0.5 rounded-full border border-[#315B3B]/20">
                  FREE
                </span>
              </div>
            </div>
          </div>

          {/* Attached Materials */}
          {materials && materials.length > 0 && (
            <div className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-[#315B3B]" />
                <p className="text-xs font-bold text-[#20251F] uppercase tracking-wider">
                  Included Study Resources ({materials.length})
                </p>
              </div>
              <div className="space-y-2">
                {materials.map((mat: any) => (
                  <div
                    key={mat.id}
                    onClick={() => window.open(mat.file_url, '_blank')}
                    className="flex items-center gap-3 bg-[#FFFCF7] hover:bg-[#FFF0E5]/50 border border-[#E8E5DE] hover:border-[#F26A21]/30 rounded-xl p-3 cursor-pointer transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E8F0E7] flex items-center justify-center text-[#315B3B] flex-shrink-0 group-hover:bg-[#FFF0E5] group-hover:text-[#F26A21] transition-colors">
                      <FileText size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#20251F] truncate group-hover:text-[#F26A21] transition-colors">
                        {mat.title}
                      </p>
                      {mat.file_size && (
                        <p className="text-[10px] text-[#6B716B]">{formatFileSize(mat.file_size)}</p>
                      )}
                    </div>
                    <Download size={14} className="text-[#939A92] group-hover:text-[#F26A21] transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-sm md:sticky md:top-24">
            <div className="text-center pb-4 mb-4 border-b border-[#E8E5DE]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#315B3B]">
                Peer Support
              </span>
              <p className="text-3xl font-black text-[#315B3B] mt-1 mb-0.5">FREE</p>
              <p className="text-xs text-[#6B716B]">No hidden costs · Provided by SPECS</p>
            </div>

            {isOwn ? (
              <div className="bg-[#F5F3ED] border border-[#E8E5DE] rounded-xl p-3 text-center">
                <p className="text-xs font-semibold text-[#6B716B]">This is your posted session</p>
              </div>
            ) : existingBooking ? (
              <div>
                <div className={`w-full text-center py-2.5 rounded-xl text-xs font-bold mb-3 border ${
                  existingBooking.status === 'accepted'
                    ? 'bg-[#E8F0E7] border-[#315B3B]/30 text-[#315B3B]'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  {existingBooking.status === 'accepted' ? '✓ Booking Confirmed' : '⏳ Booking Pending Approval'}
                </div>
                <Link
                  href="/dashboard/bookings"
                  className="block w-full text-center bg-[#F5F3ED] hover:bg-[#E8E5DE] text-[#20251F] py-2.5 rounded-xl text-xs font-bold transition-all border border-[#E8E5DE]"
                >
                  Manage My Bookings
                </Link>
              </div>
            ) : (
              <Link
                href={'/dashboard/bookings/new?service=' + session.id}
                className="block w-full text-center bg-[#F26A21] hover:bg-[#D95416] text-white py-3 rounded-xl text-sm font-bold shadow-xs hover:shadow transition-all"
              >
                Book This Session
              </Link>
            )}

            <div className="mt-4 pt-4 border-t border-[#E8E5DE] space-y-2">
              {[
                'Completely free of charge',
                'Verified Gordon College tutor',
                'Peer-to-peer collaborative review',
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#315B3B] flex-shrink-0" />
                  <p className="text-xs text-[#6B716B] font-medium">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Need help card */}
          <div className="bg-[#FFFCF7] border border-[#E8E5DE] rounded-2xl p-4 text-center">
            <p className="text-xs text-[#6B716B] mb-2 font-medium">
              Need a different subject or customized schedule?
            </p>
            <Link
              href="/dashboard/requests/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D95416] hover:text-[#F26A21] transition-colors"
            >
              <BookOpen size={13} />
              <span>Post a custom request →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}