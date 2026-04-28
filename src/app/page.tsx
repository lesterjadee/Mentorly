import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { error } = await supabase.from('_dummy_check').select('*').limit(1)
  const connected = !error || error.code === 'PGRST116' ||
    error.message.includes('does not exist') ||
    error.message.includes('schema cache')

  return (
    <main className="min-h-screen bg-[#080C14] text-white overflow-hidden">

      {/* nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#26619C] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-semibold text-[15px] tracking-tight">Mentorly</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/register" className="text-sm bg-[#26619C] hover:bg-[#1e4f82] transition-colors px-4 py-2 rounded-lg font-medium">
            Get started
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="relative px-8 pt-24 pb-20 max-w-6xl mx-auto">

        {/* glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#26619C]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#26619C]" />
            Now in beta — free for students
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Learn from peers.
            <br />
            <span className="text-[#26619C]">Earn while you teach.</span>
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            Mentorly connects college students who need help with those who can provide it —
            building an affordable, trusted marketplace for student-to-student knowledge sharing.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="bg-[#26619C] hover:bg-[#1e4f82] transition-all px-6 py-3 rounded-xl font-medium text-sm">
              Find a tutor
            </Link>
            <Link href="/register" className="bg-white/5 hover:bg-white/10 border border-white/10 transition-all px-6 py-3 rounded-xl font-medium text-sm text-white/80">
              Offer your skills
            </Link>
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-4 mt-20 max-w-2xl mx-auto">
          {[
            { value: '2,400+', label: 'Active tutors' },
            { value: '18 subjects', label: 'Categories' },
            { value: '4.9 / 5', label: 'Avg. rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center bg-white/3 border border-white/8 rounded-2xl py-6 px-4">
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="px-8 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: '◈',
              title: 'Verified student profiles',
              desc: 'Every tutor is a real enrolled student with a trust score built from reviews and session history.',
            },
            {
              icon: '⬡',
              title: 'Instant booking',
              desc: 'Browse, filter, and book a session in under 2 minutes. Online or in-person — your choice.',
            },
            {
              icon: '◎',
              title: 'Fair pricing',
              desc: 'Students set their own rates. Get quality help without paying agency fees or premium prices.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-[#26619C]/40 transition-colors group">
              <div className="text-[#26619C] text-2xl mb-4 group-hover:scale-110 transition-transform inline-block">
                {f.icon}
              </div>
              <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/5 px-8 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <p className="text-xs text-white/20">© 2025 Mentorly. Built for students, by students.</p>
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
          connected
            ? 'border-green-500/20 text-green-400/60'
            : 'border-red-500/20 text-red-400/60'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          {connected ? 'All systems operational' : 'DB disconnected'}
        </div>
      </footer>

    </main>
  )
}