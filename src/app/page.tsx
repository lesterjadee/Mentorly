import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowRight, BookOpen, Users, Shield,
  CheckCircle, GraduationCap, MessageSquare,
  FileText, Calendar, Star
} from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: sessionCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })

  const { count: bookingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })

  const { count: materialsCount } = await supabase
    .from('study_materials')
    .select('*', { count: 'exact', head: true })

  const { data: specsMembers } = await supabase
    .from('users')
    .select('id, full_name, course')
    .eq('is_specs_member', true)
    .limit(5)

  const displayUsers = Math.max(userCount || 0, 80)
  const displaySessions = Math.max(sessionCount || 0, 24)
  const displayBookings = Math.max(bookingCount || 0, 150)
  const displayMaterials = Math.max(materialsCount || 0, 40)

  return (
    <main className="min-h-screen bg-[#050810] text-white overflow-x-hidden">

      {/* ── STICKY NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/5 bg-[#050810]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#26619C] flex items-center justify-center shadow-lg shadow-[#26619C]/30">
            <span className="text-white font-black text-xs tracking-tighter">SC</span>
          </div>
          <div>
            <span className="font-black text-[15px] tracking-tight">SPECS</span>
            <span className="hidden sm:inline text-white/30 text-xs ml-2">Academic Support</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
          <Link href="/features" className="hover:text-white transition-colors duration-150">About</Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors duration-150">How it works</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors px-3 py-2">
            Sign in
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 bg-[#26619C] hover:bg-[#1e4f82] active:scale-95 transition-all duration-150 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-[#26619C]/20"
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
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
        </div>

        {/* grid lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />

        <div className="relative text-center max-w-4xl mx-auto">

          {/* org pill */}
          <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white/60 mb-10">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4a8fd4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#26619C]"></span>
              </span>
              <span className="text-[#4a8fd4] font-medium">Society of Programming Enthusiasts</span>
            </span>
            <span className="text-white/20">·</span>
            <span>Gordon College</span>
          </div>

          {/* headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-black tracking-tighter leading-[0.95] mb-6">
            Free academic
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#4a8fd4] via-[#26619C] to-[#5b9bd5]">
                support.
              </span>
              <span className="absolute -inset-2 bg-[#26619C]/10 rounded-xl blur-xl -z-0" />
            </span>
          </h1>

          {/* subheadline */}
          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-4 leading-relaxed font-light">
            SPECS connects Gordon College students with peer academic support —
            <span className="text-white/60"> completely free, no fees, no payments.</span>
          </p>
          <p className="text-sm text-white/25 mb-10">
            Tutoring sessions, study materials, and academic help — all provided by SPECS members.
          </p>

          {/* CTA group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] shadow-lg shadow-[#26619C]/25 active:scale-95 transition-all duration-150 px-8 py-4 rounded-xl font-bold text-base"
            >
              Get academic help now
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-150 px-8 py-4 rounded-xl font-medium text-base text-white/70 hover:text-white"
            >
              How SPECS helps
            </Link>
          </div>

          {/* trust signals */}
          <div className="flex items-center justify-center gap-6 flex-wrap text-xs text-white/30">
            {[
              'Free for all GC students',
              'No fees ever',
              'Verified SPECS tutors',
              'Real study materials'
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-[#26619C]/80" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* SPECS member avatars */}
        {specsMembers && specsMembers.length > 0 && (
          <div className="relative mt-20 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {specsMembers.slice(0, 5).map((member, i) => (
                  <div
                    key={member.id}
                    className="w-9 h-9 rounded-full border-2 border-[#050810] flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: ['#26619C', '#0ea5e9', '#6366f1', '#10b981', '#8b5cf6'][i % 5],
                      zIndex: 5 - i
                    }}
                  >
                    {member.full_name?.[0]}
                  </div>
                ))}
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-xs text-white/30 text-center">
              {specsMembers.length} SPECS members ready to help you succeed
            </p>
          </div>
        )}
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/5 bg-white/2 py-10 px-6 md:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: displayUsers + '+', label: 'Students helped' },
            { value: displaySessions + '+', label: 'Sessions offered' },
            { value: displayBookings + '+', label: 'Sessions completed' },
            { value: displayMaterials + '+', label: 'Study materials' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">{stat.value}</p>
              <p className="text-xs text-white/30 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT SPECS OFFERS ── */}
      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-4">What we offer</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5">
            Everything you need
            <span className="text-white/30"> to succeed.</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            SPECS members are Gordon College students who excel in their subjects and dedicate their time to helping their fellow students — all for free.
          </p>
        </div>

        {/* bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* big left card */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#0d1f35] to-[#0a1628] border border-[#26619C]/20 rounded-3xl p-8 relative overflow-hidden group hover:border-[#26619C]/40 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#26619C]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center mb-6">
              <Calendar size={20} className="text-[#4a8fd4]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Book a tutoring session</h3>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Browse sessions posted by SPECS members, pick a schedule that works for you, and book a one-on-one or group tutoring session — completely free.
            </p>
            <div className="flex items-center gap-3 text-xs text-white/30 flex-wrap">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Free always
              </span>
              <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">Online or in-person</span>
              <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">Flexible scheduling</span>
            </div>
          </div>

          {/* study materials */}
          <div className="bg-gradient-to-br from-[#0d1a2e] to-[#0a1020] border border-blue-500/20 rounded-3xl p-7 group hover:border-blue-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <FileText size={20} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Study materials library</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Access reviewer notes, study guides, and reference materials uploaded by SPECS members — no booking required.
            </p>
          </div>

          {/* post a request */}
          <div className="bg-gradient-to-br from-[#1a0d2e] to-[#140a24] border border-purple-500/20 rounded-3xl p-7 group hover:border-purple-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
              <BookOpen size={20} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Post a help request</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Tell us what subject you need help with. SPECS members will reach out with sessions tailored to your needs.
            </p>
          </div>

          {/* verified tutors */}
          <div className="bg-gradient-to-br from-[#0d2015] to-[#0a1a10] border border-green-500/20 rounded-3xl p-7 group hover:border-green-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
              <Shield size={20} className="text-green-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Verified SPECS tutors</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Every tutor is a verified SPECS member — a real Gordon College student dedicated to academic excellence.
            </p>
          </div>

          {/* messaging */}
          <div className="bg-gradient-to-br from-[#001a1a] to-[#001414] border border-teal-500/20 rounded-3xl p-7 group hover:border-teal-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6">
              <MessageSquare size={20} className="text-teal-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Direct messaging</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Message SPECS tutors directly to ask questions, share files, or coordinate your session details.
            </p>
          </div>
        </div>
      </section>

      {/* ── ABOUT SPECS ── */}
      <section className="py-24 px-6 md:px-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-4">About SPECS</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-5">
                Students helping
                <br />
                <span className="text-[#26619C]">students.</span>
              </h2>
              <p className="text-white/40 leading-relaxed mb-6">
                The Society of Programming Enthusiasts (SPECS) is a student organization at Gordon College committed to academic excellence and community support. We believe that peer learning is the most effective form of education.
              </p>
              <p className="text-white/40 leading-relaxed mb-8">
                Our members volunteer their time and knowledge to help fellow students navigate difficult subjects — because when one student succeeds, the whole community benefits.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] transition-colors px-6 py-3 rounded-xl font-semibold text-sm"
              >
                Join the platform
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: GraduationCap,
                  title: 'Academic excellence',
                  desc: 'SPECS tutors are top-performing students who genuinely understand the material.',
                  color: 'text-[#4a8fd4]',
                  bg: 'bg-[#26619C]/10 border-[#26619C]/20',
                },
                {
                  icon: Users,
                  title: 'Community driven',
                  desc: 'This platform exists because SPECS believes in lifting each other up — no financial incentive needed.',
                  color: 'text-green-400',
                  bg: 'bg-green-500/10 border-green-500/20',
                },
                {
                  icon: Shield,
                  title: 'Safe and trusted',
                  desc: 'Exclusive to Gordon College students. Every account is verified with a @gordoncollege.edu.ph email.',
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10 border-purple-500/20',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 bg-white/3 border border-white/8 rounded-2xl p-5">
                  <div className={'w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ' + item.bg}>
                    <item.icon size={18} className={item.color} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{item.title}</p>
                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 md:px-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-4">How it works</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Get help in
              <br />
              <span className="text-[#26619C]">three simple steps.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Create your free account',
                desc: 'Sign up with your Gordon College email. No credit card, no fees, no commitment.',
                color: 'text-[#4a8fd4]',
                border: 'border-[#26619C]/20',
                bg: 'bg-[#26619C]/5',
              },
              {
                step: '02',
                title: 'Browse or request help',
                desc: 'Find a SPECS tutoring session that fits your schedule, or post a request for the subject you need.',
                color: 'text-purple-400',
                border: 'border-purple-500/20',
                bg: 'bg-purple-500/5',
              },
              {
                step: '03',
                title: 'Learn and succeed',
                desc: 'Attend your session, download study materials, and watch your understanding — and grades — improve.',
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
              <div className="inline-flex items-center gap-2 mb-6 bg-[#26619C]/10 border border-[#26619C]/20 rounded-full px-4 py-2">
                <span className="w-7 h-7 rounded-md bg-[#26619C] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-[10px]">SC</span>
                </span>
                <span className="text-xs text-[#4a8fd4] font-medium">Society of Programming Enthusiasts</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5">
                Your classmates want
                <br />
                <span className="text-[#26619C]">to help you.</span>
              </h2>
              <p className="text-white/40 mb-10 max-w-md mx-auto">
                SPECS members are ready to support you — free tutoring, free materials, free of charge. All you have to do is show up.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2.5 bg-white text-[#050810] hover:bg-white/90 active:scale-95 transition-all duration-150 px-10 py-4 rounded-xl font-black text-base shadow-2xl shadow-white/10"
              >
                Get started — it's completely free
                <ArrowRight size={16} />
              </Link>
              <p className="text-white/20 text-xs mt-5">
                Gordon College students only · @gordoncollege.edu.ph required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-6 md:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#26619C] flex items-center justify-center">
                <span className="text-white font-black text-[9px]">SC</span>
              </div>
              <div>
                <span className="text-xs font-black text-white/70">SPECS</span>
                <span className="text-white/30 text-xs ml-1.5">Academic Support</span>
              </div>
            </div>
            <p className="text-xs text-white/20">© 2025 · Society of Programming Enthusiasts</p>
            <div className="flex items-center gap-4">
              <Link href="/features" className="text-xs text-white/20 hover:text-white/50 transition-colors">About</Link>
              <Link href="/how-it-works" className="text-xs text-white/20 hover:text-white/50 transition-colors">How it works</Link>
              <Link href="/terms" className="text-xs text-white/20 hover:text-white/50 transition-colors">Terms</Link>
              <Link href="/login" className="text-xs text-white/20 hover:text-white/50 transition-colors">Sign in</Link>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/25">
            <span>Powered by</span>
            <span className="text-white/50 font-semibold">Gordon College</span>
            <span className="text-yellow-400">⚡</span>
          </div>
        </div>
      </footer>

      {/* ── STICKY MOBILE CTA ── */}
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