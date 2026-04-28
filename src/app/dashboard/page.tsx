import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Briefcase, Star, ChevronRight, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: servicesCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', user.id)

  const { count: bookingsCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', user.id)

  const name = profile?.full_name || user.email
  const firstName = name?.split(' ')[0]
  const role = profile?.role || 'learner'

  return (
    <div>
      {/* header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-white/40 text-sm mb-1">Good day,</p>
          <h1 className="text-3xl font-bold">{firstName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <GraduationCap size={13} className="text-white/30" />
            <span className="text-xs text-white/30">
              {profile?.course} · {profile?.school}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 ${
          role === 'tutor' ? 'border-[#26619C]/40 text-[#4a8fd4] bg-[#26619C]/10' :
          role === 'learner' ? 'border-teal-500/30 text-teal-400 bg-teal-500/10' :
          'border-purple-500/30 text-purple-400 bg-purple-500/10'
        }`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          {role === 'both' ? 'Tutor & Learner' : role === 'tutor' ? 'Tutor' : 'Learner'}
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: BookOpen, label: 'Sessions booked', value: bookingsCount ?? 0, sub: 'Total bookings made' },
          { icon: Briefcase, label: 'Services listed', value: servicesCount ?? 0, sub: 'Active services' },
          { icon: Star, label: 'Trust score', value: profile?.trust_score ?? '—', sub: 'Based on reviews' },
        ].map((card) => (
          <div key={card.label} className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">{card.label}</p>
              <card.icon size={14} className="text-white/20" />
            </div>
            <p className="text-3xl font-bold mb-1">{card.value}</p>
            <p className="text-xs text-white/30">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* quick actions */}
      <div className="space-y-3">
        {(role === 'learner' || role === 'both') && (
          <Link href="/dashboard/marketplace" className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-teal-500/20 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <BookOpen size={16} className="text-teal-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Browse tutors</p>
                <p className="text-xs text-white/30 mt-0.5">Find help for your subjects</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
          </Link>
        )}

        {(role === 'tutor' || role === 'both') && (
          <Link href="/dashboard/services/new" className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-[#26619C]/30 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center">
                <Briefcase size={16} className="text-[#4a8fd4]" />
              </div>
              <div>
                <p className="font-medium text-sm">List a service</p>
                <p className="text-xs text-white/30 mt-0.5">Start earning by helping others</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
          </Link>
        )}

        {(role === 'learner' || role === 'both') && (
          <Link href="/dashboard/requests/new" className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-purple-500/20 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <BookOpen size={16} className="text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Post a request</p>
                <p className="text-xs text-white/30 mt-0.5">Tell tutors what you need help with</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
          </Link>
        )}
      </div>
    </div>
  )
}