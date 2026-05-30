import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Clock, Shield, Users,
  FileText, Download, BookOpen, MessageSquare
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
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/sessions" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <p className="text-white/40 text-sm">Back to sessions</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* main content */}
        <div className="md:col-span-2 space-y-5">

          {/* session header */}
          <div className="bg-gradient-to-br from-[#0d1f35] to-[#0a1628] border border-[#26619C]/20 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="text-xs font-bold text-green-400 border border-green-500/20 bg-green-500/10 px-3 py-1 rounded-full">
                FREE SESSION
              </span>
              <span className="text-xs text-white/30 border border-white/8 px-2 py-1 rounded-full">
                {typeLabel[session.session_type] || 'Tutoring'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight mb-2">{session.title}</h1>
            {session.description && (
              <p className="text-white/50 text-sm leading-relaxed">{session.description}</p>
            )}
          </div>

          {/* SPECS tutor card */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-4">Your SPECS tutor</p>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#26619C] flex items-center justify-center text-lg font-black text-white flex-shrink-0">
                {session.tutor?.full_name?.[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm">{session.tutor?.full_name}</p>
                  <div className="flex items-center gap-1">
                    <Shield size={10} className="text-[#4a8fd4]" />
                    <span className="text-[10px] text-[#4a8fd4] font-medium">
                      SPECS {session.tutor?.specs_role || 'Member'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-white/40">{session.tutor?.course} · {session.tutor?.school}</p>
                {session.tutor?.bio && (
                  <p className="text-xs text-white/30 mt-2 leading-relaxed">{session.tutor.bio}</p>
                )}
              </div>
            </div>
            {!isOwn && (
              <Link
                href={'/dashboard/messages/' + session.tutor_id}
                className="flex items-center justify-center gap-2 mt-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white"
              >
                <MessageSquare size={13} />
                Message {session.tutor?.full_name?.split(' ')[0]}
              </Link>
            )}
          </div>

          {/* session details */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-4">Session details</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Subject</span>
                <span className="text-xs font-medium">{session.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Mode</span>
                <span className="text-xs font-medium capitalize">{session.mode}</span>
              </div>
              {session.max_participants && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Max participants</span>
                  <span className="text-xs font-medium flex items-center gap-1">
                    <Users size={11} /> {session.max_participants} students
                  </span>
                </div>
              )}
              {session.start_date && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Calendar size={11} /> Date
                  </span>
                  <span className="text-xs font-medium">
                    {formatDate(session.start_date)}
                    {session.end_date && session.end_date !== session.start_date
                      ? ' → ' + formatDate(session.end_date)
                      : ''}
                  </span>
                </div>
              )}
              {session.daily_start_time && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Clock size={11} /> Time
                  </span>
                  <span className="text-xs font-medium">
                    {formatEndTime(session.daily_start_time, session.hours_per_day || 1)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-white/40">Cost</span>
                <span className="text-sm font-black text-green-400">FREE</span>
              </div>
            </div>
          </div>

          {/* study materials */}
          {materials && materials.length > 0 && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={14} className="text-blue-400" />
                <p className="text-xs text-white/30 uppercase tracking-wider">
                  Study materials ({materials.length})
                </p>
              </div>
              <div className="space-y-2">
                {materials.map((mat: any) => (
                  <div
                    key={mat.id}
                    onClick={() => window.open(mat.file_url, '_blank')}
                    className="flex items-center gap-3 bg-white/3 hover:bg-blue-500/5 border border-white/8 hover:border-blue-500/20 rounded-xl p-3 cursor-pointer transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/70 truncate group-hover:text-white transition-colors">
                        {mat.title}
                      </p>
                      {mat.file_size && (
                        <p className="text-[10px] text-white/30">{formatFileSize(mat.file_size)}</p>
                      )}
                    </div>
                    <Download size={13} className="text-white/20 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/20 mt-3 text-center">
                These materials are free to download — no booking required
              </p>
            </div>
          )}
        </div>

        {/* sticky sidebar — book */}
        <div className="space-y-4">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5 md:sticky md:top-24">
            <div className="text-center mb-5">
              <p className="text-3xl font-black text-green-400 mb-1">FREE</p>
              <p className="text-xs text-white/30">No fees · Provided by SPECS</p>
            </div>

            {isOwn ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p className="text-xs text-white/30">This is your session</p>
              </div>
            ) : existingBooking ? (
              <div>
                <div className={
                  'w-full text-center py-3 rounded-xl text-xs font-semibold mb-3 ' +
                  (existingBooking.status === 'accepted'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400')
                }>
                  {existingBooking.status === 'accepted' ? '✓ Booking confirmed' : '⏳ Booking pending'}
                </div>
                <Link
                  href="/dashboard/bookings"
                  className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-2.5 rounded-xl text-xs font-medium text-white/50 hover:text-white"
                >
                  View my bookings
                </Link>
              </div>
            ) : (
              <Link
                href={'/dashboard/bookings/new?service=' + session.id}
                className="block w-full text-center bg-[#26619C] hover:bg-[#1e4f82] active:scale-95 transition-all py-3.5 rounded-xl text-sm font-bold"
              >
                Book this session
              </Link>
            )}

            <div className="mt-4 space-y-2">
              {[
                'Completely free of charge',
                'Verified SPECS tutor',
                'Gordon College students only',
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Shield size={10} className="text-[#4a8fd4] flex-shrink-0" />
                  <p className="text-[10px] text-white/30">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* request help instead */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
            <p className="text-xs text-white/30 mb-3 leading-relaxed">
              Need a different topic or schedule?
            </p>
            <Link
              href="/dashboard/requests/new"
              className="flex items-center justify-center gap-1.5 text-xs text-[#4a8fd4] hover:text-white transition-colors"
            >
              <BookOpen size={12} />
              Post a help request
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}