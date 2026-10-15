'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, School, BookOpen, Mail, Edit3, Check, ExternalLink, ShieldCheck, GraduationCap } from 'lucide-react'
import Link from 'next/link'

const COURSES = [
  'Computer Science', 'Information Technology', 'Engineering', 'Business Administration',
  'Nursing', 'Education', 'Architecture', 'Accountancy', 'Psychology', 'Communication',
  'Political Science', 'Biology', 'Mathematics', 'Physics', 'Chemistry', 'Other'
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ services: 0, bookings: 0, completedSessions: 0 })

  const [fullName, setFullName] = useState('')
  const [school, setSchool] = useState('')
  const [course, setCourse] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const { data: p } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (p) {
        setProfile(p)
        setFullName(p.full_name || '')
        setSchool(p.school || '')
        setCourse(p.course || '')
        setBio(p.bio || '')
      }

      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', user.id)

      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('learner_id', user.id)

      const { count: completedCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .or('learner_id.eq.' + user.id + ',tutor_id.eq.' + user.id)
        .eq('status', 'completed')

      setStats({
        services: servicesCount || 0,
        bookings: bookingsCount || 0,
        completedSessions: completedCount || 0,
      })
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('users')
      .update({ full_name: fullName, school, course, bio })
      .eq('id', user.id)

    setProfile((prev: any) => ({ ...prev, full_name: fullName, school, course, bio }))
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[#F26A21] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E7] text-[#315B3B] text-xs font-semibold mb-1">
            <GraduationCap size={13} />
            Academic Profile
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">My Profile</h1>
          <p className="text-[#6B716B] text-sm mt-0.5">Manage your campus identity, course, and peer bio</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-1.5 text-[#315B3B] text-xs bg-[#E8F0E7] border border-[#315B3B]/30 px-3 py-1.5 rounded-xl font-semibold shadow-xs">
              <Check size={14} />
              Saved!
            </div>
          )}
          <Link
            href={'/dashboard/tutor/' + user?.id}
            className="flex items-center gap-2 bg-white hover:bg-[#F5F3ED] border border-[#E8E5DE] transition-all px-3.5 py-2 rounded-xl text-xs font-semibold text-[#20251F] shadow-xs"
          >
            <ExternalLink size={13} className="text-[#6B716B]" />
            Public view
          </Link>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-2xl font-bold text-[#F26A21] flex-shrink-0 shadow-xs">
            {profile.full_name?.[0] || user?.email?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#20251F]">{profile.full_name}</h2>
                <p className="text-xs text-[#6B716B] mt-0.5">{user?.email}</p>
                {(profile.course || profile.school) && (
                  <p className="text-xs text-[#315B3B] font-medium mt-1">
                    {profile.course} {profile.course && profile.school ? '·' : ''} {profile.school}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#F5F3ED] border border-[#E8E5DE] rounded-xl text-xs font-semibold text-[#20251F] transition-all flex-shrink-0 shadow-xs"
              >
                <Edit3 size={13} className="text-[#F26A21]" />
                {editing ? 'Cancel' : 'Edit profile'}
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className={
                'px-2.5 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5 ' +
                (profile.role === 'tutor' ? 'border-[#F26A21]/20 text-[#F26A21] bg-[#FFF0E5]' :
                profile.role === 'learner' ? 'border-[#315B3B]/20 text-[#315B3B] bg-[#E8F0E7]' :
                'border-[#315B3B]/20 text-[#315B3B] bg-[#E8F0E7]')
              }>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {profile.role === 'both' ? 'Tutor & Learner' : profile.role === 'tutor' ? 'Tutor' : 'Learner'}
              </span>
              <span className="text-xs text-[#315B3B] font-semibold bg-[#E8F0E7] border border-[#315B3B]/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} />
                SPECS Verified
              </span>
            </div>

            {profile.bio && !editing && (
              <p className="text-xs text-[#6B716B] mt-3.5 leading-relaxed bg-[#FFFCF7] p-3 rounded-xl border border-[#E8E5DE]">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Active Services', value: stats.services, color: 'text-[#F26A21]' },
          { label: 'Sessions Booked', value: stats.bookings, color: 'text-[#315B3B]' },
          { label: 'Completed', value: stats.completedSessions, color: 'text-[#20251F]' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E8E5DE] rounded-2xl p-4 text-center shadow-xs">
            <p className={'text-2xl font-bold ' + s.color}>{s.value}</p>
            <p className="text-xs font-medium text-[#6B716B] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
          <p className="text-xs font-bold text-[#315B3B] uppercase tracking-wider mb-2">Edit Information</p>

          <div>
            <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">Full name</label>
            <div className="relative">
              <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B716B]" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl pl-11 pr-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">School / University</label>
            <div className="relative">
              <School size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B716B]" />
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Gordon College"
                className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl pl-11 pr-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">Course / Program</label>
            <div className="relative">
              <BookOpen size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B716B]" />
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl pl-11 pr-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
              >
                <option value="">Select your course</option>
                {COURSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about your academic focus, strengths, and what subjects you enjoy teaching or studying..."
              rows={3}
              className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm placeholder-[#6B716B]/50 focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#F26A21] hover:bg-[#D95416] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-semibold shadow-xs"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      )}

      {/* SPECS Community Support Card */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#E8F0E7] text-[#315B3B] flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#20251F]">SPECS Academic Community</h3>
            <p className="text-xs text-[#6B716B]">Gordon College Society of Peer Educators and Computer Scientists</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-[#FFFCF7] rounded-xl border border-[#E8E5DE]">
            <div>
              <p className="text-sm font-semibold text-[#20251F]">100% Free Peer Tutoring</p>
              <p className="text-xs text-[#6B716B] mt-0.5">SPECS members volunteer their time to mentor fellow students without fees.</p>
            </div>
            <span className="text-xs font-bold text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 px-3 py-1 rounded-full">
              Free
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#FFFCF7] rounded-xl border border-[#E8E5DE]">
            <div>
              <p className="text-sm font-semibold text-[#20251F]">Community Service Learning</p>
              <p className="text-xs text-[#6B716B] mt-0.5">Academic support focused entirely on collaborative campus learning.</p>
            </div>
            <span className="text-xs font-bold text-[#F26A21] bg-[#FFF0E5] border border-[#F26A21]/20 px-3 py-1 rounded-full">
              Community
            </span>
          </div>
        </div>
      </div>

      {/* Account Details Card */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 shadow-xs">
        <p className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-4">Account Information</p>
        <div className="space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5F3ED] flex items-center justify-center text-[#6B716B] flex-shrink-0">
              <Mail size={16} />
            </div>
            <div>
              <p className="text-xs text-[#6B716B]">Registered Email</p>
              <p className="text-sm font-semibold text-[#20251F]">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5F3ED] flex items-center justify-center text-[#6B716B] flex-shrink-0">
              <User size={16} />
            </div>
            <div>
              <p className="text-xs text-[#6B716B]">Account Role</p>
              <p className="text-sm font-semibold text-[#20251F] capitalize">
                {profile.role === 'both' ? 'Tutor & Learner' : profile.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
