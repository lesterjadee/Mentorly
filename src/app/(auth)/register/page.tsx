'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Mail, Lock, User, BookOpen, School, CheckCircle } from 'lucide-react'

const COURSES = [
  'Computer Science', 'Information Technology', 'Engineering', 'Business Administration',
  'Nursing', 'Education', 'Architecture', 'Accountancy', 'Psychology', 'Communication',
  'Political Science', 'Biology', 'Mathematics', 'Physics', 'Chemistry', 'Other'
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [school, setSchool] = useState('')
  const [course, setCourse] = useState('')
  const [role, setRole] = useState<'learner' | 'tutor' | 'both' | ''>('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!fullName || !school || !course || !role || !email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, school, course, role },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#080C14] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-[#26619C]" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            We sent a confirmation link to <span className="text-white/70">{email}</span>.
            Click it to activate your Mentorly account.
          </p>
          <Link href="/login" className="text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors">
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#080C14] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-[#26619C] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none"/>
                <circle cx="7" cy="7" r="2" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-white text-[15px]">Mentorly</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-white/40 text-sm">Join thousands of students on Mentorly</p>
        </div>

        {/* step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                step >= s ? 'bg-[#26619C] text-white' : 'bg-white/5 text-white/30'
              }`}>{s}</div>
              {s < 2 && <div className={`w-12 h-px transition-colors ${step > s ? 'bg-[#26619C]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-8">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-6">Step 1 — Personal & academic info</p>

              {/* full name */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Full name</label>
                <div className="relative">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan dela Cruz"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
                  />
                </div>
              </div>

              {/* school */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">School / University</label>
                <div className="relative">
                  <School size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="University of the Philippines"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
                  />
                </div>
              </div>

              {/* course */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Course / Program</label>
                <div className="relative">
                  <BookOpen size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors appearance-none"
                  >
                    <option value="" disabled className="bg-[#080C14]">Select your course</option>
                    {COURSES.map((c) => (
                      <option key={c} value={c} className="bg-[#080C14]">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* role */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">I want to join as</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'learner', label: 'Learner', desc: 'Find tutors & get help' },
                    { value: 'tutor', label: 'Tutor', desc: 'Offer skills & earn' },
                    { value: 'both', label: 'Both', desc: 'Learn and teach' },
                  ].map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        role === r.value
                          ? 'border-[#26619C] bg-[#26619C]/10'
                          : 'border-white/10 bg-white/3 hover:border-white/20'
                      }`}
                    >
                      <p className={`text-xs font-medium mb-1 ${role === r.value ? 'text-[#4a8fd4]' : 'text-white/70'}`}>
                        {r.label}
                      </p>
                      <p className="text-[10px] text-white/30 leading-tight">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!fullName || !school || !course || !role) {
                    setError('Please fill in all fields.')
                    return
                  }
                  setError('')
                  setStep(2)
                }}
                className="w-full bg-[#26619C] hover:bg-[#1e4f82] transition-colors py-3 rounded-xl text-white text-sm font-medium mt-2"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-6">Step 2 — Account credentials</p>

              {/* email */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
                  />
                </div>
              </div>

              {/* password */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
                  />
                </div>
                <p className="text-white/20 text-xs mt-2">Minimum 6 characters</p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-white/60 text-sm font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <p className="text-white/30 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-[#26619C] hover:text-[#4a8fd4] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}