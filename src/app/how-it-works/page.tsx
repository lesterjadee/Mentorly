import Link from 'next/link'
import { UserPlus, Search, Calendar, Star } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#080C14] text-white">

      <nav className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#26619C] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-semibold text-[15px]">Mentorly</span>
        </Link>
        <Link href="/register" className="text-sm bg-[#26619C] hover:bg-[#1e4f82] transition-all px-4 py-2 rounded-lg font-medium">
          Get started
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How Mentorly works</h1>
          <p className="text-white/40 text-lg">Get started in minutes — whether you want to learn or earn.</p>
        </div>

        {/* for learners */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs font-medium text-teal-400">For learners</div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: UserPlus, step: '01', title: 'Create your account', desc: 'Sign up for free with your student email in under a minute.' },
              { icon: Search, step: '02', title: 'Browse tutors', desc: 'Search by subject, filter by price and mode, read reviews.' },
              { icon: Calendar, step: '03', title: 'Book a session', desc: 'Pick a date, time, and duration. Send a booking request.' },
              { icon: Star, step: '04', title: 'Leave a review', desc: 'After your session, rate your tutor to help others.' },
            ].map((s) => (
              <div key={s.step} className="bg-white/3 border border-white/8 rounded-2xl p-5 relative">
                <span className="text-[10px] text-white/20 font-mono absolute top-4 right-4">{s.step}</span>
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4">
                  <s.icon size={16} className="text-teal-400" />
                </div>
                <p className="font-medium text-sm mb-1">{s.title}</p>
                <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* for tutors */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="px-3 py-1 bg-[#26619C]/10 border border-[#26619C]/20 rounded-full text-xs font-medium text-[#4a8fd4]">For tutors</div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: UserPlus, step: '01', title: 'Create your account', desc: 'Sign up free and set up your student profile.' },
              { icon: Search, step: '02', title: 'List your service', desc: 'Add your subjects, set your hourly rate, and describe what you offer.' },
              { icon: Calendar, step: '03', title: 'Accept bookings', desc: 'Review incoming requests and accept or decline them.' },
              { icon: Star, step: '04', title: 'Build your reputation', desc: 'Complete sessions, earn reviews, and grow your trust score.' },
            ].map((s) => (
              <div key={s.step} className="bg-white/3 border border-white/8 rounded-2xl p-5 relative">
                <span className="text-[10px] text-white/20 font-mono absolute top-4 right-4">{s.step}</span>
                <div className="w-9 h-9 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center mb-4">
                  <s.icon size={16} className="text-[#4a8fd4]" />
                </div>
                <p className="font-medium text-sm mb-1">{s.title}</p>
                <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] transition-all px-6 py-3 rounded-xl font-medium text-sm">
            Get started for free
          </Link>
        </div>
      </div>
    </main>
  )
}