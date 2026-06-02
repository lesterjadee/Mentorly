'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Sparkles, FileText, User, Calendar, ClipboardList } from 'lucide-react'
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
  hasBooking: boolean
  isSpecsMember: boolean
  hasSession?: boolean
  hasMaterial?: boolean
  // legacy props — ignored but kept for backward compat
  hasService?: boolean
  hasBio?: boolean
}

export default function InAppNudge({
  hasProfile,
  hasBooking,
  isSpecsMember,
  hasSession = false,
  hasMaterial = false,
}: Props) {
  const [dismissed, setDismissed] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)

  const studentNudges: Nudge[] = [
    !hasProfile && {
      id: 'profile',
      icon: User,
      iconColor: 'text-[#4a8fd4]',
      iconBg: 'bg-[#26619C]/10 border-[#26619C]/20',
      title: 'Complete your profile',
      desc: 'A complete profile helps SPECS tutors prepare better sessions for you.',
      cta: 'Update profile',
      href: '/dashboard/profile',
    },
    !hasBooking && {
      id: 'browse',
      icon: Calendar,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/10 border-green-500/20',
      title: 'Free SPECS sessions are available',
      desc: 'Browse tutoring sessions posted by SPECS members — completely free.',
      cta: 'Browse sessions',
      href: '/dashboard/sessions',
    },
    {
      id: 'materials',
      icon: FileText,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      title: 'Study materials are waiting for you',
      desc: 'SPECS has uploaded reviewers and notes you can download right now.',
      cta: 'View materials',
      href: '/dashboard/materials',
    },
    {
      id: 'request',
      icon: ClipboardList,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      title: 'Need help with a specific topic?',
      desc: 'Post a help request and SPECS members will offer sessions tailored to you.',
      cta: 'Post a request',
      href: '/dashboard/requests/new',
    },
  ].filter(Boolean).filter((n: any) => !dismissed.includes(n.id)) as Nudge[]

  const specsNudges: Nudge[] = [
    !hasProfile && {
      id: 'profile',
      icon: User,
      iconColor: 'text-[#4a8fd4]',
      iconBg: 'bg-[#26619C]/10 border-[#26619C]/20',
      title: 'Complete your profile',
      desc: 'Students will see your profile before booking — make a great first impression.',
      cta: 'Update profile',
      href: '/dashboard/profile',
    },
    !hasSession && {
      id: 'session',
      icon: Calendar,
      iconColor: 'text-[#4a8fd4]',
      iconBg: 'bg-[#26619C]/10 border-[#26619C]/20',
      title: 'Post your first SPECS session',
      desc: 'Students are waiting for help. Post a session and make a difference.',
      cta: 'Post a session',
      href: '/dashboard/sessions/new',
    },
    !hasMaterial && {
      id: 'material',
      icon: FileText,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      title: 'Share a study material',
      desc: 'Upload a reviewer or notes so students can learn even outside sessions.',
      cta: 'Upload material',
      href: '/dashboard/materials/upload',
    },
    {
      id: 'requests',
      icon: Sparkles,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/10 border-yellow-500/20',
      title: 'Students are asking for help',
      desc: 'Check the requests board — students are posting what subjects they need.',
      cta: 'View requests',
      href: '/dashboard/requests/browse',
    },
  ].filter(Boolean).filter((n: any) => !dismissed.includes(n.id)) as Nudge[]

  const allNudges = isSpecsMember ? specsNudges : studentNudges
  const nudge = allNudges[currentIdx % Math.max(allNudges.length, 1)]

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