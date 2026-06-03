'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, School, BookOpen, Mail, Edit3, Check, ExternalLink } from 'lucide-react'
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
        <div className="w-5 h-5 border-2 border-[#26619C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">My Profile</h1>
          <p className="text-white/40 text-sm mt-1">Manage your public profile</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl">
              <Check size={13} />
              Saved!
            </div>
          )}
          <Link
            href={'/dashboard/tutor/' + user?.id}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all px-3 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white"
          >
            <ExternalLink size={12} />
            Public view
          </Link>
        </div>
      </div>

      {/* profile card */}
      <div className="bg-gradient-to-br from-[#0d1f35] to-[#0a1628] border border-[#26619C]/20 rounded-2xl p-6 mb-5">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-2xl font-black text-[#4a8fd4] flex-shrink-0">
            {profile.full_name?.[0] || user?.email?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{profile.full_name}</h2>
                <p className="text-white/40 text-xs mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-all flex-shrink-0"
              >
                <Edit3 size={12} />
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className={
              'mt-2 px-2.5 py-1 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 ' +
              (profile.role === 'tutor' ? 'border-[#26619C]/40 text-[#4a8fd4] bg-[#26619C]/10' :
              profile.role === 'learner' ? 'border-teal-500/30 text-teal-400 bg-teal-500/10' :
              'border-purple-500/30 text-purple-400 bg-purple-500/10')
            }>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {profile.role === 'both' ? 'Tutor & Learner' : profile.role === 'tutor' ? 'Tutor' : 'Learner'}
            </div>

            {profile.bio && !editing && (
              <p className="text-sm text-white/40 mt-3 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Services', value: stats.services },
          { label: 'Booked', value: stats.bookings },
          { label: 'Completed', value: stats.completedSessions },
        ].map((s) => (
          <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* SPECS support */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen size={15} className="text-[#4a8fd4]" />
          <p className="text-sm font-bold">SPECS support</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold">Free tutoring</p>
                <p className="text-xs text-white/30">SPECS members volunteer their time to help Gordon College students.</p>
              </div>
              <p className="text-xl font-black text-yellow-400">
                Free
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30">No payment required</span>
            </div>
          </div>

          <div className="border-t border-white/5" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold">Community service</p>
                <p className="text-xs text-white/30">Sessions are offered as academic support, not paid tutoring.</p>
              </div>
              <p className="text-xl font-black text-[#4a8fd4]">
                Free
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30">Focused on helping students learn</span>
            </div>
          </div>
        </div>

      </div>

      {/* edit form */}
      {editing && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4 mb-5">
          <p className="text-xs text-white/30 uppercase tracking-wider">Edit information</p>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Full name</label>
            <div className="relative">
              <User size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">School / University</label>
            <div className="relative">
              <School size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Course / Program</label>
            <div className="relative">
              <BookOpen size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors appearance-none"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c} className="bg-[#0d1117]">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself, your strengths, and what you enjoy teaching or learning..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-bold"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}

      {/* account info */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
        <p className="text-xs text-white/30 uppercase tracking-wider mb-4">Account</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail size={14} className="text-white/20 flex-shrink-0" />
            <div>
              <p className="text-xs text-white/30">Email</p>
              <p className="text-sm text-white/70 mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User size={14} className="text-white/20 flex-shrink-0" />
            <div>
              <p className="text-xs text-white/30">Account type</p>
              <p className="text-sm text-white/70 mt-0.5 capitalize">
                {profile.role === 'both' ? 'Tutor & Learner' : profile.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
