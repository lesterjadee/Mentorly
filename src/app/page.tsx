import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Star, Shield, Zap } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { error } = await supabase.from('_dummy_check').select('*').limit(1)
  const connected = !error || error.code === 'PGRST116' ||
    error.message.includes('does not exist') ||
    error.message.includes('schema cache')

  return (
    <main className="min-h-screen bg-[#080C14] text-white overflow-hidden">

      {/* nav */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-white/5 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#26619C] flex items-center justify-center animate-pulse-glow">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-semibold text-[15px] tracking-tight">Mentorly</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          {['Features', 'How it works', 'Pricing'].map((item) => (
            <a key={item} href="#" className="hover:text-white transition-colors duration-200">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/60 hover:text-white transition-colors duration-200 px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-[#26619C] hover:bg-[#1e4f82] active:scale-95 transition-all duration-200 px-4 py-2 rounded-lg font-medium flex items-center gap-1.5"
          >
            Get started
            <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="relative px-6 md:px-8 pt-20 md:pt-28 pb-20 max-w-6xl mx-auto">

        {/* glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#26619C]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-[#26619C]/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-8 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-[#26619C] animate-pulse" />
            Now in beta — free for students
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 animate-fade-in-up delay-75">
            Learn from peers.
            <br />
            <span className="text-[#26619C]">Earn while you teach.</span>
          </h1>

          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-150">
            Mentorly connects college students who need help with those who can provide it —
            building an affordable, trusted marketplace for student-to-student knowledge sharing.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in-up delay-225">
            <Link
              href="/register"
              className="bg-[#26619C] hover:bg-[#1e4f82] active:scale-95 transition-all duration-200 px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2"
            >
              Find a tutor
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/register"
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-200 px-6 py-3 rounded-xl font-medium text-sm text-white/80"
            >
              Offer your skills
            </Link>
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mt-16 md:mt-20 max-w-2xl mx-auto animate-fade-in-up delay-300">
          {[
            { value: '2,400+', label: 'Active tutors' },
            { value: '18 subjects', label: 'Categories' },
            { value: '4.9 / 5', label: 'Avg. rating' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center glass rounded-2xl py-5 md:py-6 px-4 hover:border-[#26619C]/20 transition-colors duration-300"
            >
              <p className="text-xl md:text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="px-6 md:px-8 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Shield,
              title: 'Verified student profiles',
              desc: 'Every tutor is a real enrolled student with a trust score built from reviews and session history.',
              color: 'text-[#4a8fd4]',
              bg: 'bg-[#26619C]/10',
              border: 'border-[#26619C]/20',
              hover: 'hover:border-[#26619C]/40',
            },
            {
              icon: Zap,
              title: 'Instant booking',
              desc: 'Browse, filter, and book a session in under 2 minutes. Online or in-person — your choice.',
              color: 'text-teal-400',
              bg: 'bg-teal-500/10',
              border: 'border-teal-500/20',
              hover: 'hover:border-teal-500/40',
            },
            {
              icon: Star,
              title: 'Fair pricing',
              desc: 'Students set their own rates. Get quality help without paying agency fees or premium prices.',
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/10',
              border: 'border-yellow-500/20',
              hover: 'hover:border-yellow-500/40',
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className={'glass rounded-2xl p-6 transition-all duration-300 group ' + f.hover + ' animate-fade-in-up'}
              style={{ animationDelay: (300 + i * 75) + 'ms' }}
            >
              <div className={'w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-transform duration-300 group-hover:scale-110 ' + f.bg + ' ' + f.border}>
                <f.icon size={18} className={f.color} />
              </div>
              <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-6 md:px-8 py-8 max-w-6xl mx-auto mb-8">
        <div className="relative glass rounded-2xl p-8 md:p-10 overflow-hidden text-center">
          <div className="absolute inset-0 bg-[#26619C]/5 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#26619C]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to get started?</h2>
            <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
              Join thousands of students already learning and earning on Mentorly.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] active:scale-95 transition-all duration-200 px-6 py-3 rounded-xl font-medium text-sm"
            >
              Create free account
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/5 px-6 md:px-8 py-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#26619C] flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <p className="text-xs text-white/20">© 2025 Mentorly. Built for students, by students.</p>
        </div>
        <div className={
          'flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ' +
          (connected ? 'border-green-500/20 text-green-400/60' : 'border-red-500/20 text-red-400/60')
        }>
          <span className={'w-1.5 h-1.5 rounded-full ' + (connected ? 'bg-green-500 animate-pulse' : 'bg-red-500')} />
          {connected ? 'All systems operational' : 'DB disconnected'}
        </div>
      </footer>
    </main>
  )
}