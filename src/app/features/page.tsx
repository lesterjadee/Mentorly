import Link from 'next/link'
import { Shield, Zap, Star, BookOpen, MessageSquare, Calendar, TrendingUp, Users } from 'lucide-react'

export default function FeaturesPage() {
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

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Everything you need to learn and earn</h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Mentorly is built specifically for college students — affordable, trusted, and easy to use.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Shield, title: 'Verified student profiles', desc: 'Every user is a real enrolled student. Trust scores are built from session history and peer reviews.', color: 'text-[#4a8fd4]', bg: 'bg-[#26619C]/10', border: 'border-[#26619C]/20' },
            { icon: Zap, title: 'Instant booking', desc: 'Browse tutors, filter by subject, and book a session in under 2 minutes — online or in-person.', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
            { icon: Star, title: 'Trust score system', desc: 'After every session, students leave reviews. Tutors build a visible reputation over time.', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
            { icon: MessageSquare, title: 'Real-time messaging', desc: 'Chat directly with your tutor or student before and after sessions using our live chat system.', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
            { icon: Calendar, title: 'Smart scheduling', desc: 'Pick your date, time, and duration. The system automatically prevents overlapping bookings.', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
            { icon: TrendingUp, title: 'Personalized recommendations', desc: 'Get tutor suggestions based on your course, activity, and subject needs.', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
            { icon: BookOpen, title: 'Help request board', desc: 'Post what you need help with and let tutors come to you with their offers.', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
            { icon: Users, title: 'Tutor & learner in one', desc: 'Your account lets you both offer services and book sessions — switch roles anytime.', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
          ].map((f) => (
            <div key={f.title} className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all duration-300 group">
              <div className={'w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ' + f.bg + ' ' + f.border}>
                <f.icon size={18} className={f.color} />
              </div>
              <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] transition-all px-6 py-3 rounded-xl font-medium text-sm">
            Create free account
          </Link>
        </div>
      </div>
    </main>
  )
}