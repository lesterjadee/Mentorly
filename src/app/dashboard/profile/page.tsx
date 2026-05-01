'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, School, BookOpen, Mail, Star, Briefcase, Edit3, Check } from 'lucide-react'

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
  const [stats, setStats] = useState({ services: 0, bookings: 0, reviews: 0 })

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

      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('reviewee_id', user.id)

      setStats({
        services: servicesCount || 0,
        bookings: bookingsCount || 0,
        reviews: reviewsCount || 0,
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
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-white/40 text-sm mt-1">Manage your personal information</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl">
            <Check size={14} />
            Profile saved!
          </div>
        )}
      </div>

      {/* profile card */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-5">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-2xl font-bold text-[#4a8fd4] flex-shrink-0">
            {profile.full_name?.[0] || user?.email?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{profile.full_name}</h2>
                <p className="text-white/40 text-sm mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-white/60 hover:text-white transition-all flex-shrink-0"
              >
                <Edit3 size={12} />
                {editing ? 'Cancel' : 'Edit profile'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className={'px-2.5 py-1 rounded-full border text-xs font-medium ' +
                (profile.role === 'tutor' ? 'border-[#26619C]/40 text-[#4a8fd4] bg-[#26619C]/10' :
                profile.role === 'learner' ? 'border-teal-500/30 text-teal-400 bg-teal-500/10' :
                'border-purple-500/30 text-purple-400 bg-purple-500/10')
              }>
                {profile.role === 'both' ? 'Tutor & Learner' : profile.role === 'tutor' ? 'Tutor' : 'Learner'}
              </div>
              {profile.trust_score > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-xs text-yellow-400">
                  <Star size={10} className="fill-yellow-400" />
                  {profile.trust_score} trust score
                </div>
              )}
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
          { icon: Briefcase, label: 'Services listed', value: stats.services },
          { icon: BookOpen, label: 'Sessions booked', value: stats.bookings },
          { icon: Star, label: 'Reviews received', value: stats.reviews },
        ].map((s) => (
          <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center">
            <s.icon size={14} className="text-white/20 mx-auto mb-2" />
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* edit form */}
      {editing && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Edit information</p>

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
                  <option key={c} value={c} className="bg-[#080C14]">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Bio — optional</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other students a bit about yourself, your expertise, and what you enjoy teaching or learning..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}

      {/* account info */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mt-5">
        <p className="text-xs text-white/30 uppercase tracking-wider mb-4">Account information</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail size={14} className="text-white/20 flex-shrink-0" />
            <div>
              <p className="text-xs text-white/30">Email address</p>
              <p className="text-sm text-white/70 mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User size={14} className="text-white/20 flex-shrink-0" />
            <div>
              <p className="text-xs text-white/30">Account type</p>
              <p className="text-sm text-white/70 mt-0.5 capitalize">{profile.role === 'both' ? 'Tutor & Learner' : profile.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}