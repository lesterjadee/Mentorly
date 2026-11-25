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
      iconColor: 'text-[#D95416]',
      iconBg: 'bg-[#FFF0E5] border-[#F26A21]/20',
      title: 'Complete your student profile',
      desc: 'Add your course and academic bio to help peer tutors personalize their support.',
      cta: 'Update profile',
      href: '/dashboard/profile',
    },
    !hasBooking && {
      id: 'browse',
      icon: Calendar,
      iconColor: 'text-[#315B3B]',
      iconBg: 'bg-[#E8F0E7] border-[#315B3B]/20',
      title: 'Free peer tutoring sessions available',
      desc: 'Explore active tutoring sessions posted by SPECS mentors — 100% free for Gordon College students.',
      cta: 'Browse sessions',
      href: '/dashboard/sessions',
    },
    {
      id: 'materials',
      icon: FileText,
      iconColor: 'text-[#315B3B]',
      iconBg: 'bg-[#E8F0E7] border-[#315B3B]/20',
      title: 'Verified study materials and notes',
      desc: 'Download free reviewers, lecture decks, and exercises prepared by senior students.',
      cta: 'View materials',
      href: '/dashboard/materials',
    },
    {
      id: 'request',
      icon: ClipboardList,
      iconColor: 'text-[#D95416]',
      iconBg: 'bg-[#FFF0E5] border-[#F26A21]/20',
      title: 'Need help with a specific course?',
      desc: 'Submit a tutoring request and available SPECS mentors will reach out to schedule.',
      cta: 'Post a request',
      href: '/dashboard/requests/new',
    },
  ].filter(Boolean).filter((n: any) => !dismissed.includes(n.id)) as Nudge[]

  const specsNudges: Nudge[] = [
    !hasProfile && {
      id: 'profile',
      icon: User,
      iconColor: 'text-[#315B3B]',
      iconBg: 'bg-[#E8F0E7] border-[#315B3B]/20',
      title: 'Complete your mentor profile',
      desc: 'Introduce your expertise and subjects to learners across the university.',
      cta: 'Update profile',
      href: '/dashboard/profile',
    },
    !hasSession && {
      id: 'session',
      icon: Calendar,
      iconColor: 'text-[#D95416]',
      iconBg: 'bg-[#FFF0E5] border-[#F26A21]/20',
      title: 'Post your first peer tutoring session',
      desc: 'Host a workshop or 1-on-1 tutoring session for students who need academic guidance.',
      cta: 'Post a session',
      href: '/dashboard/sessions/new',
    },
    !hasMaterial && {
      id: 'material',
      icon: FileText,
      iconColor: 'text-[#315B3B]',
      iconBg: 'bg-[#E8F0E7] border-[#315B3B]/20',
      title: 'Share your reviewers and study notes',
      desc: 'Upload reference materials to assist students preparing for upcoming exams.',
      cta: 'Upload material',
      href: '/dashboard/materials/upload',
    },
    {
      id: 'requests',
      icon: Sparkles,
      iconColor: 'text-[#D95416]',
      iconBg: 'bg-[#FFF0E5] border-[#F26A21]/20',
      title: 'Students are actively requesting tutoring',
      desc: 'Browse the open requests board to match with students seeking help in your subjects.',
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
    <div className="bg-white border border-[#E8E5DE] rounded-2xl p-3.5 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#D9D4C7] transition-all duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${nudge.iconBg}`}>
          <nudge.icon size={16} className={nudge.iconColor} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#20251F] tracking-tight leading-snug">{nudge.title}</p>
          <p className="text-xs text-[#6B716B] mt-0.5 leading-relaxed line-clamp-1">{nudge.desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
        <Link
          href={nudge.href}
          className="flex items-center gap-1.5 bg-[#FFF0E5] hover:bg-[#FFE3CF] border border-[#F26A21]/20 hover:border-[#F26A21]/35 transition-all duration-150 px-3.5 py-2 rounded-xl text-xs font-bold text-[#D95416] whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(242,106,33,0.15)] hover:-translate-y-0.5"
        >
          {nudge.cta}
          <ArrowRight size={12} />
        </Link>
        <button
          onClick={() => {
            setDismissed((d) => [...d, nudge.id])
            setCurrentIdx((i) => i + 1)
          }}
          className="w-7 h-7 rounded-lg bg-[#F5F3ED] hover:bg-[#E8E5DE] flex items-center justify-center text-[#939A92] hover:text-[#20251F] transition-all duration-150"
          title="Dismiss"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
