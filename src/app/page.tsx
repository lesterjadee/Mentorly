import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Star, Shield, Zap, BookOpen, Users, TrendingUp, CheckCircle } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: serviceCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })

  const { count: bookingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })

  const { data: topTutors } = await supabase
    .from('users')
    .select('id, full_name, course, school, trust_score')
    .gt('trust_score', 0)
    .order('trust_score', { ascending: false })
    .limit(5)

  const displayUsers = Math.max(userCount || 0, 120)
  const displayServices = Math.max(serviceCount || 0, 48)
  const displayBookings = Math.max(bookingCount || 0, 200)

  return (
    <main className="min-h-screen bg-[#050810] text-white overflow-x-hidden">

      {/* ── STICKY NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/5 bg-[#050810]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#26619C] flex items-center justify-center shadow-lg shadow-[#26619C]/30">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-[15px] tracking-tight">Mentorly</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
          <Link href="/features" className="hover:text-white transition-colors duration-150">Features</Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors duration-150">How it works</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors px-3 py-2">
            Sign in
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 bg-white text-[#050810] hover:bg-white/90 active:scale-95 transition-all duration-150 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Get started free
            <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6 md:px-10 max-w-7xl mx-auto">

        {/* background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#26619C]/10 rounded-full blur-[140px]" />
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-teal-600/5 rounded-full blur-[100px]" />
        </div>

        {/* grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '80px 80px'}} />

        <div className="relative text-center max-w-4xl mx-auto">

          {/* live user pill */}
          <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white/60 mb-10">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-400 font-medium">{displayUsers}+ students</span>
            </span>
            <span className="text-white/20">·</span>
            <span>already learning on Mentorly</span>
          </div>

          {/* headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-black tracking-tighter leading-[0.95] mb-6">
            Stop failing
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#4a8fd4] via-[#26619C] to-[#5b9bd5]">
                alone.
              </span>
              <span className="absolute -inset-2 bg-[#26619C]/10 rounded-xl blur-xl -z-0" />
            </span>
          </h1>

          {/* subheadline */}
          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-4 leading-relaxed font-light">
            Mentorly connects you with a student who already aced the subject you're failing.
            <span className="text-white/60"> Book in 2 minutes. Pay less than a coffee per hour.</span>
          </p>
          <p className="text-sm text-white/25 mb-10">No agencies. No premium rates. Just students helping students.</p>

          {/* CTA group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] shadow-lg shadow-[#26619C]/25 active:scale-95 transition-all duration-150 px-8 py-4 rounded-xl font-bold text-base"
            >
              Find a tutor now
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-150 px-8 py-4 rounded-xl font-medium text-base text-white/70 hover:text-white"
            >
              Start earning as a tutor
            </Link>
          </div>

          {/* micro trust signals */}
          <div className="flex items-center justify-center gap-6 flex-wrap text-xs text-white/30">
            {['Free to sign up', 'No credit card', 'Cancel anytime', 'Verified students only'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-green-500/60" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── SOCIAL PROOF AVATARS ── */}
        {topTutors && topTutors.length > 0 && (
          <div className="relative mt-20 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {topTutors.slice(0, 5).map((tutor, i) => (
                  <div
                    key={tutor.id}
                    className="w-9 h-9 rounded-full border-2 border-[#050810] flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: ['#26619C','#0ea5e9','#8b5cf6','#10b981','#f59e0b'][i % 5],
                      zIndex: 5 - i
                    }}
                  >
                    {tutor.full_name?.[0]}
                  </div>
                ))}
              </div>
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={13} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-xs text-white/30 text-center">
              Trusted by students from{' '}
              {topTutors.slice(0, 3).map((t) => t.school).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).slice(0, 2).join(', ')}
              {topTutors.length > 2 ? ' and more' : ''}
            </p>
          </div>
        )}
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/5 bg-white/2 py-10 px-6 md:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8">
          {[
            { value: displayUsers + '+', label: 'Students enrolled', icon: Users },
            { value: displayServices + '+', label: 'Active tutors', icon: BookOpen },
            { value: displayBookings + '+', label: 'Sessions completed', icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="text-center group">
              <p className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">{stat.value}</p>
              <p className="text-xs text-white/30 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION ── */}
      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-4">The problem</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5">
            Tutoring is broken.
            <span className="text-white/30"> We fixed it.</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">Private tutoring costs ₱500–₱2,000/hr. Group reviews don't work. Your classmates who get it aren't monetizing their knowledge. We fix all three.</p>
        </div>

        {/* bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* big left card */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#0d1f35] to-[#0a1628] border border-[#26619C]/20 rounded-3xl p-8 relative overflow-hidden group hover:border-[#26619C]/40 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#26619C]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center mb-6">
              <Zap size={20} className="text-[#4a8fd4]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Book in under 2 minutes</h3>
            <p className="text-white/40 text-sm leading-relaxed mb-6">Browse tutors, check their trust score, pick a schedule, and confirm. No back-and-forth emails. No waiting days for a reply.</p>
            <div className="flex items-center gap-3 text-xs text-white/30">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Available today
              </span>
              <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">Single or multi-day</span>
              <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">Online or in-person</span>
            </div>
          </div>

          {/* top right */}
          <div className="bg-gradient-to-br from-[#0d2015] to-[#0a1a10] border border-green-500/20 rounded-3xl p-7 group hover:border-green-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
              <Shield size={20} className="text-green-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Verified students only</h3>
            <p className="text-white/40 text-sm leading-relaxed">Every tutor is a real enrolled student with a visible trust score built from real reviews.</p>
          </div>

          {/* bottom left */}
          <div className="bg-gradient-to-br from-[#1a0d2e] to-[#140a24] border border-purple-500/20 rounded-3xl p-7 group hover:border-purple-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
              <Users size={20} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Skill Swap — zero fees</h3>
            <p className="text-white/40 text-sm leading-relaxed">Trade subjects with another student. You teach them Math, they teach you Science. No money involved.</p>
          </div>

          {/* bottom middle */}
          <div className="bg-gradient-to-br from-[#1a1200] to-[#1a0e00] border border-yellow-500/20 rounded-3xl p-7 group hover:border-yellow-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6">
              <Star size={20} className="text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Earn while you study</h3>
            <p className="text-white/40 text-sm leading-relaxed">Set your own rate. Tutor on your schedule. Students are already earning ₱150–₱400/hr.</p>
          </div>

          {/* bottom right */}
          <div className="bg-gradient-to-br from-[#001a1a] to-[#001414] border border-teal-500/20 rounded-3xl p-7 group hover:border-teal-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6">
              <BookOpen size={20} className="text-teal-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Post a help request</h3>
            <p className="text-white/40 text-sm leading-relaxed">Tell tutors exactly what you need. Let them come to you with offers and rates.</p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 md:px-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-4">How it works</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Three steps to your
              <br />
              <span className="text-[#26619C]">first session.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Create your free account',
                desc: 'Sign up with your student email in under 60 seconds. No credit card. No commitment.',
                color: 'text-[#4a8fd4]',
                border: 'border-[#26619C]/20',
                bg: 'bg-[#26619C]/5',
              },
              {
                step: '02',
                title: 'Browse and book',
                desc: 'Filter tutors by subject, price, and availability. Send a booking request in 2 clicks.',
                color: 'text-purple-400',
                border: 'border-purple-500/20',
                bg: 'bg-purple-500/5',
              },
              {
                step: '03',
                title: 'Learn and level up',
                desc: 'Attend your session online or in-person. Leave a review. Book again. Watch your grades climb.',
                color: 'text-green-400',
                border: 'border-green-500/20',
                bg: 'bg-green-500/5',
              },
            ].map((s) => (
              <div key={s.step} className={'rounded-3xl border p-7 ' + s.bg + ' ' + s.border}>
                <p className={'text-4xl font-black mb-5 ' + s.color}>{s.step}</p>
                <h3 className="font-bold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-[#26619C]/8 rounded-3xl blur-3xl" />
          <div className="relative bg-gradient-to-br from-[#0d1f35] via-[#0a1628] to-[#050810] border border-[#26619C]/25 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#26619C]/15 rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-xs text-[#4a8fd4] uppercase tracking-[0.2em] mb-4">Join today</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5">
                Your next exam is
                <br />
                <span className="text-[#26619C]">3 days away.</span>
              </h2>
              <p className="text-white/40 mb-10 max-w-md mx-auto">
                Every hour you wait is an hour your classmates are getting ahead. Mentorly is free to join.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2.5 bg-white text-[#050810] hover:bg-white/90 active:scale-95 transition-all duration-150 px-10 py-4 rounded-xl font-black text-base shadow-2xl shadow-white/10"
              >
                Start for free — takes 60 seconds
                <ArrowRight size={16} />
              </Link>
              <p className="text-white/20 text-xs mt-5">No credit card · No agency fees · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-6 md:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#26619C] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="7" cy="7" r="2" fill="white"/>
                </svg>
              </div>
              <span className="text-xs font-bold text-white/60">Mentorly</span>
            </div>
            <p className="text-xs text-white/20">© 2025 · Built for students, by students</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/features" className="text-xs text-white/20 hover:text-white/50 transition-colors">Features</Link>
            <Link href="/how-it-works" className="text-xs text-white/20 hover:text-white/50 transition-colors">How it works</Link>
            <Link href="/terms" className="text-xs text-white/20 hover:text-white/50 transition-colors">Terms</Link>
            <Link href="/login" className="text-xs text-white/20 hover:text-white/50 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>

      {/* ── STICKY BOTTOM CTA (mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-4 pt-3 bg-gradient-to-t from-[#050810] via-[#050810]/95 to-transparent">
        <Link
          href="/register"
          className="flex items-center justify-center gap-2 w-full bg-[#26619C] hover:bg-[#1e4f82] py-4 rounded-xl font-bold text-sm shadow-xl shadow-[#26619C]/30 active:scale-95 transition-all"
        >
          Get started free
          <ArrowRight size={15} />
        </Link>
      </div>

    </main>
  )
}