'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Sparkles, Briefcase, User, BookOpen } from 'lucide-react'
import Link from 'next/link'

type Nudge = {
  id: string
  icon: any
  iconColor: string
  iconBg: string
  title: string
  desc: string
  cta: string
  href: string
}

type Props = {
  hasProfile: boolean
  hasService: boolean
  hasBooking: boolean
  hasBio: boolean
}

export default function InAppNudge({ hasProfile, hasService, hasBooking, hasBio }: Props) {
  const [dismissed, setDismissed] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)

  const allNudges: Nudge[] = [
    !hasBio && {
      id: 'bio',
      icon: User,
      iconColor: 'text-[#4a8fd4]',
      iconBg: 'bg-[#26619C]/10 border-[#26619C]/20',
      title: 'Add a bio to get 3x more bookings',
      desc: 'Students book tutors they feel they know. A 2-sentence bio makes all the difference.',
      cta: 'Add bio',
      href: '/dashboard/profile',
    },
    !hasService && {
      id: 'service',
      icon: Briefcase,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      title: 'You could be earning right now',
      desc: 'Students are actively looking for tutors. List your first service in 2 minutes.',
      cta: 'List a service',
      href: '/dashboard/services/new',
    },
    !hasBooking && {
      id: 'booking',
      icon: BookOpen,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10 border-teal-500/20',
      title: 'Find a tutor for your hardest subject',
      desc: 'Browse 48+ active tutors. Book a session for less than a cup of coffee per hour.',
      cta: 'Browse tutors',
      href: '/dashboard/marketplace',
    },
    {
      id: 'swap',
      icon: Sparkles,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/10 border-yellow-500/20',
      title: 'Did you know? You can trade subjects for free',
      desc: 'Skill Swap lets you tutor someone in what you know in exchange for help in what you don\'t.',
      cta: 'Try Skill Swap',
      href: '/dashboard/trades',
    },
  ].filter(Boolean).filter((n: any) => !dismissed.includes(n.id)) as Nudge[]

  const nudge = allNudges[currentIdx % Math.max(allNudges.length, 1)]

  // rotate nudges every 8 seconds
  useEffect(() => {
    if (allNudges.length <= 1) return
    const t = setInterval(() => setCurrentIdx((i) => i + 1), 8000)
    return () => clearInterval(t)
  }, [allNudges.length])

  if (!nudge || allNudges.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-white/3 to-white/2 border border-white/8 rounded-2xl p-4 mb-6 flex items-center gap-4 group hover:border-white/15 transition-colors">
      <div className={'w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ' + nudge.iconBg}>
        <nudge.icon size={16} className={nudge.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{nudge.title}</p>
        <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{nudge.desc}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={nudge.href}
          className="flex items-center gap-1.5 bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/20 transition-all px-3 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white whitespace-nowrap"
        >
          {nudge.cta}
          <ArrowRight size={11} />
        </Link>
        <button
          onClick={() => {
            setDismissed((d) => [...d, nudge.id])
            setCurrentIdx((i) => i + 1)
          }}
          className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/20 hover:text-white/50 transition-colors"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  )
}