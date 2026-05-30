import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, Clock, FileText, Shield,
  Plus, Search, BookOpen, Users
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
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">SPECS Sessions</h1>
          <p className="text-white/40 text-sm">
            Free academic support · {(sessions || []).length} session{(sessions || []).length !== 1 ? 's' : ''} available
          </p>
        </div>
        {isSpecsMember && (
          <Link
            href="/dashboard/sessions/new"
            className="flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-[#26619C]/20"
          >
            <Plus size={15} />
            Post session
          </Link>
        )}
      </div>

      {/* search */}
      <form className="relative mb-4">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search sessions by title..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
        />
        {subject !== 'All' && <input type="hidden" name="subject" value={subject} />}
        {sessionType !== 'all' && <input type="hidden" name="type" value={sessionType} />}
      </form>

      {/* session type pills */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 mb-3 scrollbar-hide">
        {SESSION_TYPES.map((t) => (
          <Link
            key={t.value}
            href={'/dashboard/sessions?type=' + t.value + (subject !== 'All' ? '&subject=' + subject : '') + (query ? '&q=' + query : '')}
            className={
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ' +
              (sessionType === t.value
                ? 'bg-[#26619C] border-[#26619C] text-white'
                : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/70')
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* subject filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {SUBJECTS.map((s) => (
          <Link
            key={s}
            href={'/dashboard/sessions?subject=' + s + (sessionType !== 'all' ? '&type=' + sessionType : '') + (query ? '&q=' + query : '')}
            className={
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ' +
              (subject === s
                ? 'bg-white/10 border-white/30 text-white'
                : 'border-white/8 text-white/30 hover:border-white/15 hover:text-white/60')
            }
          >
            {s}
          </Link>
        ))}
      </div>

      {/* session cards */}
      {sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session: any) => {
            const matCount = materialsCount[session.id] || 0
            const isOwn = session.tutor_id === user.id

            return (
              <div
                key={session.id}
                className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-[#26619C]/30 transition-all group"
              >
                {/* tutor info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#26619C] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {session.tutor?.full_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/70 truncate">
                        {session.tutor?.full_name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Shield size={9} className="text-[#4a8fd4] flex-shrink-0" />
                        <p className="text-[10px] text-[#4a8fd4]">
                          SPECS {session.tutor?.specs_role || 'Member'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-bold text-green-400 border border-green-500/20 bg-green-500/10 px-2 py-0.5 rounded-full">
                      FREE
                    </span>
                    <span className="text-[10px] text-white/30 border border-white/8 px-2 py-0.5 rounded-full">
                      {typeLabel[session.session_type] || 'Tutoring'}
                    </span>
                  </div>
                </div>

                {/* title + description */}
                <h3 className="font-bold text-sm mb-1 line-clamp-1">{session.title}</h3>
                {session.description && (
                  <p className="text-xs text-white/30 leading-relaxed mb-3 line-clamp-2">
                    {session.description}
                  </p>
                )}

                {/* tags */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg">
                    {session.category}
                  </span>
                  <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg capitalize">
                    {session.mode}
                  </span>
                  {session.max_participants && (
                    <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Users size={9} />
                      Max {session.max_participants}
                    </span>
                  )}
                </div>

                {/* schedule */}
                {session.start_date && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="flex items-center gap-1 text-xs text-white/30">
                      <Calendar size={10} />
                      {formatDate(session.start_date)}
                      {session.end_date && session.end_date !== session.start_date && ' → ' + formatDate(session.end_date)}
                    </span>
                    {session.daily_start_time && (
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        <Clock size={10} />
                        {formatEndTime(session.daily_start_time, session.hours_per_day || 1)}
                      </span>
                    )}
                  </div>
                )}

                {/* materials */}
                {matCount > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <FileText size={11} className="text-blue-400 flex-shrink-0" />
                    <span className="text-[10px] text-blue-400">
                      {matCount} study material{matCount !== 1 ? 's' : ''} attached
                    </span>
                  </div>
                )}

                {/* action */}
                <div className="pt-3 border-t border-white/5">
                  {isOwn ? (
                    <p className="text-xs text-white/20 text-center">Your session</p>
                  ) : (
                    <Link
                      href={'/dashboard/sessions/' + session.id}
                      className="block w-full text-center bg-[#26619C]/10 group-hover:bg-[#26619C] border border-[#26619C]/20 group-hover:border-[#26619C] transition-all py-2.5 rounded-xl text-xs font-semibold text-[#4a8fd4] group-hover:text-white"
                    >
                      View details & book
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-14 text-center">
          <Calendar size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 font-semibold mb-1">No sessions available</p>
          <p className="text-white/20 text-sm mb-5">
            {query || subject !== 'All' || sessionType !== 'all'
              ? 'Try different filters or search terms'
              : 'SPECS members haven\'t posted any sessions yet'}
          </p>
          <Link
            href="/dashboard/requests/new"
            className="text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors"
          >
            Post a help request instead →
          </Link>
        </div>
      )}
    </div>
  )
}