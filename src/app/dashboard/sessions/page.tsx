import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, Clock, FileText, Shield,
  Plus, Search, BookOpen, Users, Sparkles
} from 'lucide-react'

const SUBJECTS = [
  'All', 'Mathematics', 'Science', 'Physics', 'Chemistry',
  'Biology', 'Programming', 'Web Development', 'English',
  'Filipino', 'History', 'Accounting', 'Economics', 'Other'
]

const SESSION_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'review', label: 'Review' },
  { value: 'consultation', label: 'Consultation' },
]

type Props = {
  searchParams: Promise<{ subject?: string; type?: string; q?: string }>
}

export default async function SessionsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const subject = params.subject ?? 'All'
  const sessionType = params.type ?? 'all'
  const query = params.q ?? ''

  const { data: profile } = await supabase
    .from('users')
    .select('is_specs_member')
    .eq('id', user.id)
    .single()

  const isSpecsMember = profile?.is_specs_member || false

  let dbQuery = supabase
    .from('services')
    .select(`
      *,
      tutor:users!services_tutor_id_fkey(id, full_name, course, school, is_specs_member, specs_role, trust_score)
    `)
    .eq('is_active', true)

  if (subject !== 'All') dbQuery = dbQuery.eq('category', subject)
  if (sessionType !== 'all') dbQuery = dbQuery.eq('session_type', sessionType)
  if (query) dbQuery = dbQuery.ilike('title', '%' + query + '%')

  const { data: sessions } = await dbQuery.order('created_at', { ascending: false })

  // count study materials per session
  const sessionIds = (sessions || []).map((s: any) => s.id)
  let materialsCount: Record<string, number> = {}
  if (sessionIds.length > 0) {
    const { data: mats } = await supabase
      .from('study_materials')
      .select('session_id')
      .in('session_id', sessionIds)
    mats?.forEach((m: any) => {
      if (m.session_id) materialsCount[m.session_id] = (materialsCount[m.session_id] || 0) + 1
    })
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric'
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
    return fmt(h) + ':' + String(m).padStart(2, '0') + ' ' + period(h) + ' – ' + fmt(endH) + ':' + String(endM).padStart(2, '0') + ' ' + period(endH)
  }

  const typeLabel: Record<string, string> = {
    tutoring: 'Tutoring', workshop: 'Workshop',
    review: 'Review Session', consultation: 'Consultation',
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5.5 h-5.5 rounded-lg bg-[#E8F0E7] text-[#315B3B] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <Calendar size={12} />
            </span>
            <span className="text-[10px] font-black text-[#315B3B] uppercase tracking-widest">Academic Directory</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#20251F] leading-tight">Peer Tutoring Sessions</h1>
          <p className="text-[#6B716B] text-xs mt-0.5 font-medium">
            Free academic support from verified Gordon College SPECS tutors · {(sessions || []).length} available
          </p>
        </div>

        {isSpecsMember && (
          <Link
            href="/dashboard/sessions/new"
            className="inline-flex items-center gap-2 bg-[#F26A21] hover:bg-[#D95416] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-[0_1px_3px_rgba(217,84,22,0.25)] hover:shadow-[0_4px_12px_rgba(217,84,22,0.3)] hover:-translate-y-0.5 transition-all duration-150 self-start sm:self-auto"
          >
            <Plus size={14} />
            Post a Session
          </Link>
        )}
      </div>

      {/* Search + Session Type Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <form className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939A92]" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search sessions by course title, topic, or keyword..."
            className="w-full bg-white border border-[#E8E5DE] rounded-xl pl-10 pr-4 py-2.5 text-[#20251F] text-sm placeholder:text-[#939A92] focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/12 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] outline-none font-medium"
          />
          {subject !== 'All' && <input type="hidden" name="subject" value={subject} />}
          {sessionType !== 'all' && <input type="hidden" name="type" value={sessionType} />}
        </form>

        {/* Session Type Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 lg:pb-0 scrollbar-hide flex-shrink-0">
          {SESSION_TYPES.map((t) => (
            <Link
              key={t.value}
              href={'/dashboard/sessions?type=' + t.value + (subject !== 'All' ? '&subject=' + subject : '') + (query ? '&q=' + query : '')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
                sessionType === t.value
                  ? 'bg-[#F26A21] border-[#F26A21] text-white shadow-[0_2px_8px_rgba(242,106,33,0.25)]'
                  : 'bg-white border-[#E8E5DE] text-[#6B716B] hover:border-[#F26A21]/35 hover:text-[#20251F]'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto sm:flex-wrap pb-0.5 scrollbar-hide">
        {SUBJECTS.map((s) => (
          <Link
            key={s}
            href={'/dashboard/sessions?subject=' + s + (sessionType !== 'all' ? '&type=' + sessionType : '') + (query ? '&q=' + query : '')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
              subject === s
                ? 'bg-[#315B3B] border-[#315B3B] text-white shadow-[0_2px_8px_rgba(49,91,59,0.25)]'
                : 'bg-white border-[#E8E5DE] text-[#6B716B] hover:border-[#315B3B]/35 hover:text-[#20251F]'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Sessions Grid */}
      {sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map((session: any) => {
            const matCount = materialsCount[session.id] || 0
            const isOwn = session.tutor_id === user.id

            return (
              <div
                key={session.id}
                className="bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-[#F26A21]/35 hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Tutor info & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-sm font-black text-[#D95416] flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                        {session.tutor?.full_name?.[0] || 'T'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#20251F] truncate">
                          {session.tutor?.full_name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Shield size={10} className="text-[#315B3B] flex-shrink-0" />
                          <p className="text-[10px] font-bold text-[#315B3B] truncate">
                            SPECS {session.tutor?.specs_role || 'Mentor'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] font-black text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 px-2.5 py-0.5 rounded-full tracking-wide">
                        FREE
                      </span>
                      <span className="text-[9px] font-bold text-[#6B716B] bg-[#F5F3ED] border border-[#E8E5DE] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {typeLabel[session.session_type] || 'Tutoring'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-black text-sm text-[#20251F] mb-1 group-hover:text-[#F26A21] transition-colors duration-150 line-clamp-1 tracking-tight">
                    {session.title}
                  </h3>
                  {session.description && (
                    <p className="text-xs text-[#6B716B] leading-relaxed mb-3 line-clamp-2">
                      {session.description}
                    </p>
                  )}

                  {/* Metadata Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <span className="text-[11px] font-semibold text-[#20251F] bg-[#F5F3ED] border border-[#E8E5DE] px-2.5 py-0.5 rounded-lg">
                      {session.category}
                    </span>
                    <span className="text-[11px] font-semibold text-[#6B716B] bg-[#F5F3ED] border border-[#E8E5DE] px-2.5 py-0.5 rounded-lg capitalize">
                      {session.mode}
                    </span>
                    {session.max_participants && (
                      <span className="text-[11px] font-semibold text-[#6B716B] bg-[#F5F3ED] border border-[#E8E5DE] px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <Users size={10} className="text-[#939A92]" />
                        Up to {session.max_participants}
                      </span>
                    )}
                  </div>

                  {/* Schedule Details */}
                  {session.start_date && (
                    <div className="flex flex-wrap items-center gap-3 py-2 px-3 bg-[#F5F3ED] border border-[#E8E5DE] rounded-xl mb-3 text-xs text-[#6B716B]">
                      <span className="flex items-center gap-1.5 font-semibold text-[#20251F]">
                        <Calendar size={12} className="text-[#315B3B]" />
                        {formatDate(session.start_date)}
                        {session.end_date && session.end_date !== session.start_date && ' → ' + formatDate(session.end_date)}
                      </span>
                      {session.daily_start_time && (
                        <span className="flex items-center gap-1.5 font-medium text-[#6B716B]">
                          <Clock size={12} className="text-[#F26A21]" />
                          {formatEndTime(session.daily_start_time, session.hours_per_day || 1)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Study materials */}
                  {matCount > 0 && (
                    <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 bg-[#FFF0E5] border border-[#F26A21]/15 rounded-lg text-xs font-bold text-[#D95416]">
                      <FileText size={12} />
                      <span>{matCount} study material{matCount !== 1 ? 's' : ''} included</span>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-[#E8E5DE]/70">
                  {isOwn ? (
                    <div className="text-center py-2 text-xs font-semibold text-[#6B716B] bg-[#F5F3ED] rounded-xl">
                      Your posted session
                    </div>
                  ) : (
                    <Link
                      href={'/dashboard/sessions/' + session.id}
                      className="block w-full text-center bg-[#F26A21] hover:bg-[#D95416] text-white py-2 rounded-xl text-xs font-bold transition-all duration-150 shadow-[0_1px_3px_rgba(217,84,22,0.2)] hover:shadow-[0_4px_12px_rgba(217,84,22,0.3)] hover:-translate-y-0.5"
                    >
                      View Details & Book
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="w-full bg-white border border-[#E8E5DE] rounded-2xl p-8 sm:p-10 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF0E5] border border-[#F26A21]/15 text-[#F26A21] flex items-center justify-center mx-auto mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <Calendar size={20} />
          </div>
          <p className="text-sm font-black text-[#20251F] mb-1 tracking-tight">No sessions found</p>
          <p className="text-xs text-[#6B716B] mb-4 max-w-lg mx-auto leading-relaxed">
            {query || subject !== 'All' || sessionType !== 'all'
              ? 'Try clearing some filters or searching with different keywords.'
              : 'There are no active peer sessions right now. Post a request to let mentors know what you need!'}
          </p>
          <Link
            href="/dashboard/requests/new"
            className="inline-flex items-center gap-1.5 bg-[#315B3B] hover:bg-[#24452D] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 shadow-[0_1px_3px_rgba(49,91,59,0.2)] hover:shadow-[0_4px_12px_rgba(49,91,59,0.25)] hover:-translate-y-0.5"
          >
            Post a Help Request →
          </Link>
        </div>
      )}
    </div>
  )
}