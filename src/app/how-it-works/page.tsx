import Link from 'next/link'
import { UserPlus, Search, Calendar, Star } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] text-white">

      <nav className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E96118] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-semibold text-[15px]">Mentorly</span>
        </Link>
        <Link href="/register" className="text-sm bg-[#E96118] hover:bg-[#C94A0D] transition-all px-4 py-2 rounded-lg font-medium">
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
            <div className="px-3 py-1 bg-[#315C36]/10 border border-[#315C36]/20 rounded-full text-xs font-medium text-[#315C36]">For learners</div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: UserPlus, step: '01', title: 'Create your account', desc: 'Sign up for free with your student email in under a minute.' },
              { icon: Search, step: '02', title: 'Browse tutors', desc: 'Search by subject and mode to find available SPECS support.' },
              { icon: Calendar, step: '03', title: 'Book a session', desc: 'Pick a date, time, and duration. Send a booking request.' },
              { icon: Star, step: '04', title: 'Attend and learn', desc: 'Join the session prepared and make the most of the free academic help.' },
            ].map((s) => (
              <div key={s.step} className="bg-white/3 border border-white/8 rounded-2xl p-5 relative">
                <span className="text-[10px] text-white/20 font-mono absolute top-4 right-4">{s.step}</span>
                <div className="w-9 h-9 rounded-xl bg-[#315C36]/10 border border-[#315C36]/20 flex items-center justify-center mb-4">
                  <s.icon size={16} className="text-[#315C36]" />
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
            <div className="px-3 py-1 bg-[#E96118]/10 border border-[#E96118]/20 rounded-full text-xs font-medium text-[#F58A32]">For tutors</div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: UserPlus, step: '01', title: 'Create your account', desc: 'Sign up free and set up your student profile.' },
              { icon: Search, step: '02', title: 'List your support', desc: 'Add your subjects, available mode, and describe what you can help with.' },
              { icon: Calendar, step: '03', title: 'Accept bookings', desc: 'Review incoming requests and accept or decline them.' },
              { icon: Star, step: '04', title: 'Serve students', desc: 'Complete sessions as part of SPECS academic service to the school community.' },
            ].map((s) => (
              <div key={s.step} className="bg-white/3 border border-white/8 rounded-2xl p-5 relative">
                <span className="text-[10px] text-white/20 font-mono absolute top-4 right-4">{s.step}</span>
                <div className="w-9 h-9 rounded-xl bg-[#E96118]/10 border border-[#E96118]/20 flex items-center justify-center mb-4">
                  <s.icon size={16} className="text-[#F58A32]" />
                </div>
                <p className="font-medium text-sm mb-1">{s.title}</p>
                <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#E96118] hover:bg-[#C94A0D] transition-all px-6 py-3 rounded-xl font-medium text-sm">
            Get started for free
          </Link>
        </div>
      </div>
    </main>
  )
}
