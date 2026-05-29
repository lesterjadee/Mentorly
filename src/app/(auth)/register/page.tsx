'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  GraduationCap, Mail, Lock, User,
  BookOpen, School, CheckCircle, X,
  Eye, EyeOff, KeyRound, ShieldCheck
} from 'lucide-react'

const COURSES = [
  'Computer Science', 'Information Technology', 'Engineering', 'Business Administration',
  'Nursing', 'Education', 'Architecture', 'Accountancy', 'Psychology', 'Communication',
  'Political Science', 'Biology', 'Mathematics', 'Physics', 'Chemistry', 'Other'
]

function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f1623] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-white">Terms and Conditions</h2>
            <p className="text-xs text-white/30 mt-0.5">Last updated: 2025</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-6 text-sm text-white/50 leading-relaxed flex-1">
          <section>
            <h3 className="text-white/80 font-medium mb-2">1. Acceptance of Terms</h3>
            <p>By creating an account and using this platform, you agree to be bound by these Terms and Conditions.</p>
          </section>
          <section>
            <h3 className="text-white/80 font-medium mb-2">2. Eligibility</h3>
            <p>This platform is exclusively available to currently enrolled students of Gordon College with a valid @gordoncollege.edu.ph email address.</p>
          </section>
          <section>
            <h3 className="text-white/80 font-medium mb-2">3. SPECS Members</h3>
            <p>Members of the Society of Programming Enthusiasts (SPECS) who register with a valid invite code are granted additional privileges including posting academic sessions and uploading study materials.</p>
          </section>
          <section>
            <h3 className="text-white/80 font-medium mb-2">4. Academic Integrity</h3>
            <p>All sessions and materials shared on this platform must be used for legitimate academic purposes. Any form of academic dishonesty is strictly prohibited.</p>
          </section>
          <section>
            <h3 className="text-white/80 font-medium mb-2">5. User Responsibilities</h3>
            <p>Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>
          </section>
          <section>
            <h3 className="text-white/80 font-medium mb-2">6. Study Materials</h3>
            <p>Materials uploaded by SPECS members are shared for educational purposes. Redistribution outside the platform is not permitted.</p>
          </section>
          <section>
            <h3 className="text-white/80 font-medium mb-2">7. Sessions</h3>
            <p>All tutoring and academic support sessions facilitated through this platform are provided free of charge by SPECS members as a service to the Gordon College community.</p>
          </section>
          <section>
            <h3 className="text-white/80 font-medium mb-2">8. Privacy</h3>
            <p>Basic profile information is collected to facilitate academic connections. Your data will not be shared with third parties.</p>
          </section>
          <section>
            <h3 className="text-white/80 font-medium mb-2">9. Limitation of Liability</h3>
            <p>This platform is provided on an "as is" basis. SPECS and Gordon College shall not be held liable for any damages arising from use of the platform.</p>
          </section>
        </div>
        <div className="px-6 py-4 border-t border-white/8 flex-shrink-0">
          <button onClick={onClose} className="w-full bg-[#26619C] hover:bg-[#1e4f82] transition-colors py-2.5 rounded-xl text-white text-sm font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
  }
  const passed = Object.values(checks).filter(Boolean).length
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const labels = ['Too weak', 'Weak', 'Almost there', 'Strong']
  if (!password) return null
  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={'h-1.5 flex-1 rounded-full transition-all duration-300 ' + (passed > i ? colors[passed] : 'bg-white/10')} />
        ))}
      </div>
      <p className={'text-xs ' + (passed === 3 ? 'text-green-400' : 'text-white/30')}>{labels[passed]}</p>
      <div className="space-y-1">
        {[
          { label: 'At least 8 characters', ok: checks.length },
          { label: 'At least 1 uppercase letter (A–Z)', ok: checks.capital },
          { label: 'At least 1 symbol (!@#$%^&*...)', ok: checks.symbol },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-2">
            {c.ok ? <CheckCircle size={11} className="text-green-400 flex-shrink-0" /> : <X size={11} className="text-white/20 flex-shrink-0" />}
            <span className={'text-xs ' + (c.ok ? 'text-green-400' : 'text-white/30')}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [course, setCourse] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [showInviteCode, setShowInviteCode] = useState(false)
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [isSpecsMember, setIsSpecsMember] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const isValidEmail = email.toLowerCase().endsWith('@gordoncollege.edu.ph')
  const isValidPassword =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)

  async function checkInviteCode() {
    if (!inviteCode.trim()) return
    setCodeStatus('checking')
    const supabase = createClient()
    const { data } = await supabase
      .from('specs_settings')
      .select('invite_code')
      .eq('id', 1)
      .single()

    if (data && inviteCode.trim() === data.invite_code) {
      setCodeStatus('valid')
      setIsSpecsMember(true)
    } else {
      setCodeStatus('invalid')
      setIsSpecsMember(false)
    }
  }

  async function handleRegister() {
    if (!agreedToTerms) { setError('You must agree to the Terms and Conditions.'); return }
    if (!fullName || !course || !email || !password) { setError('Please fill in all fields.'); return }
    if (!isValidEmail) { setError('Only @gordoncollege.edu.ph emails are allowed.'); return }
    if (!isValidPassword) { setError('Password must be at least 8 characters, include 1 uppercase letter and 1 symbol.'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          school: 'Gordon College',
          course,
          role: isSpecsMember ? 'specs' : 'student',
          is_specs_member: isSpecsMember,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // if SPECS member, update the users table after signup
    if (isSpecsMember) {
      // wait a moment for the trigger to create the user profile
      await new Promise(r => setTimeout(r, 1500))
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('users')
          .update({ is_specs_member: true, specs_role: 'member' })
          .eq('id', user.id)
      }
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#080C14] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center mx-auto mb-6">
            {isSpecsMember
              ? <ShieldCheck className="text-[#26619C]" size={28} />
              : <CheckCircle className="text-[#26619C]" size={28} />
            }
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            {isSpecsMember ? 'Welcome to SPECS!' : 'Check your email'}
          </h1>
          {isSpecsMember && (
            <div className="mb-4 bg-[#26619C]/10 border border-[#26619C]/20 rounded-xl px-4 py-3">
              <p className="text-[#4a8fd4] text-xs font-medium">
                🎉 You've been registered as a SPECS member. Your account has elevated privileges.
              </p>
            </div>
          )}
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            We sent a confirmation link to{' '}
            <span className="text-white/70">{email}</span>.
            Click it to activate your account.
          </p>
          <Link href="/login" className="text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors">
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      <main className="min-h-screen bg-[#080C14] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg bg-[#26619C] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L12 4V10L7 13L2 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none"/>
                  <circle cx="7" cy="7" r="2" fill="white"/>
                </svg>
              </div>
              <span className="font-semibold text-white text-[15px]">SPECS</span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-white/40 text-sm">Gordon College Academic Support Platform</p>
          </div>

          {/* gordon college badge */}
          <div className="flex items-center justify-center gap-2 mb-6 bg-[#26619C]/5 border border-[#26619C]/20 rounded-xl px-4 py-3">
            <GraduationCap size={15} className="text-[#4a8fd4] flex-shrink-0" />
            <p className="text-xs text-white/50 text-center">
              Requires a{' '}
              <span className="text-[#4a8fd4] font-semibold">@gordoncollege.edu.ph</span>{' '}
              email to register
            </p>
          </div>

          {/* step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ' +
                  (step >= s ? 'bg-[#26619C] text-white' : 'bg-white/5 text-white/30')
                }>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && (
                  <div className={'w-10 h-px transition-colors ' + (step > s ? 'bg-[#26619C]' : 'bg-white/10')} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-8">

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
                <X size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* ── STEP 1 — personal info ── */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-6">
                  Step 1 — Personal and academic info
                </p>

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

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">School</label>
                  <div className="relative">
                    <School size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <div className="w-full bg-white/3 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white/50 text-sm">
                      Gordon College
                    </div>
                  </div>
                </div>

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

                <button
                  onClick={() => {
                    if (!fullName || !course) { setError('Please fill in all fields.'); return }
                    setError(''); setStep(2)
                  }}
                  className="w-full bg-[#26619C] hover:bg-[#1e4f82] transition-colors py-3 rounded-xl text-white text-sm font-medium mt-2"
                >
                  Continue
                </button>
              </div>
            )}

            {/* ── STEP 2 — credentials ── */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-6">
                  Step 2 — Account credentials
                </p>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Gordon College email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gordoncollege.edu.ph"
                      className={
                        'w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none transition-colors ' +
                        (email ? (isValidEmail ? 'border-green-500/40' : 'border-red-500/40') : 'border-white/10 focus:border-[#26619C]/60')
                      }
                    />
                  </div>
                  {email && !isValidEmail && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><X size={11} />Must be a @gordoncollege.edu.ph email</p>
                  )}
                  {email && isValidEmail && (
                    <p className="text-green-400 text-xs mt-1.5 flex items-center gap-1"><CheckCircle size={11} />Valid Gordon College email</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                      className={
                        'w-full bg-white/5 border rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-white/20 focus:outline-none transition-colors ' +
                        (password ? (isValidPassword ? 'border-green-500/40' : 'border-orange-500/30') : 'border-white/10 focus:border-[#26619C]/60')
                      }
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>

                <div className="flex gap-3 mt-2">
                  <button onClick={() => { setStep(1); setError('') }} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-white/60 text-sm font-medium">
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!isValidEmail) { setError('Please enter a valid @gordoncollege.edu.ph email.'); return }
                      if (!isValidPassword) { setError('Password does not meet requirements.'); return }
                      setError(''); setStep(3)
                    }}
                    disabled={!isValidEmail || !isValidPassword}
                    className="flex-1 bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-40 transition-colors py-3 rounded-xl text-white text-sm font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3 — SPECS code + terms ── */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-6">
                  Step 3 — SPECS membership (optional)
                </p>

                {/* SPECS invite code */}
                <div className="bg-[#26619C]/5 border border-[#26619C]/15 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <ShieldCheck size={16} className="text-[#4a8fd4] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white/80">Are you a SPECS member?</p>
                      <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                        Enter your SPECS invite code to unlock session management and study material uploads. Leave blank if you're a regular student.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowInviteCode(!showInviteCode)}
                    className={
                      'w-full py-2.5 rounded-xl text-xs font-semibold border transition-all ' +
                      (showInviteCode
                        ? 'bg-[#26619C]/20 border-[#26619C]/40 text-[#4a8fd4]'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20')
                    }
                  >
                    {showInviteCode ? 'Hide SPECS code field' : 'I have a SPECS invite code'}
                  </button>

                  {showInviteCode && (
                    <div className="mt-3 space-y-2">
                      <div className="relative">
                        <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                        <input
                          type="text"
                          value={inviteCode}
                          onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setCodeStatus('idle'); setIsSpecsMember(false) }}
                          placeholder="Enter SPECS invite code"
                          className={
                            'w-full bg-white/5 border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none transition-colors uppercase tracking-wider ' +
                            (codeStatus === 'valid' ? 'border-green-500/40' :
                             codeStatus === 'invalid' ? 'border-red-500/40' :
                             'border-white/10 focus:border-[#26619C]/60')
                          }
                        />
                      </div>
                      <button
                        onClick={checkInviteCode}
                        disabled={!inviteCode.trim() || codeStatus === 'checking'}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-white/50 hover:text-white transition-all disabled:opacity-40"
                      >
                        {codeStatus === 'checking' ? 'Verifying...' : 'Verify code'}
                      </button>

                      {codeStatus === 'valid' && (
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                          <ShieldCheck size={13} className="text-green-400" />
                          <p className="text-green-400 text-xs font-medium">Valid SPECS code — you'll be registered as a SPECS member</p>
                        </div>
                      )}
                      {codeStatus === 'invalid' && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                          <X size={13} className="text-red-400" />
                          <p className="text-red-400 text-xs">Invalid code. Please check with your SPECS officer.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* what you'll get based on role */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={
                    'rounded-xl p-3 border text-center transition-all ' +
                    (!isSpecsMember ? 'border-[#26619C]/30 bg-[#26619C]/5' : 'border-white/8 bg-white/3')
                  }>
                    <p className="text-xs font-semibold text-white/70 mb-1">Regular Student</p>
                    <p className="text-[10px] text-white/30 leading-relaxed">Browse sessions · Book sessions · Post requests · Message</p>
                  </div>
                  <div className={
                    'rounded-xl p-3 border text-center transition-all ' +
                    (isSpecsMember ? 'border-[#26619C]/30 bg-[#26619C]/5' : 'border-white/8 bg-white/3')
                  }>
                    <p className="text-xs font-semibold text-[#4a8fd4] mb-1">SPECS Member ⚡</p>
                    <p className="text-[10px] text-white/30 leading-relaxed">All above + Post sessions + Upload study materials</p>
                  </div>
                </div>

                {/* terms */}
                <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                  <div
                    className="flex items-start gap-3 cursor-pointer select-none"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all ' +
                        (agreedToTerms ? 'bg-[#26619C] border-[#26619C]' : 'border-white/20 bg-transparent')
                      }>
                        {agreedToTerms && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-white/40 leading-relaxed">
                      I have read and agree to the{' '}
                      <span
                        onClick={(e) => { e.stopPropagation(); setShowTerms(true) }}
                        className="text-[#26619C] hover:text-[#4a8fd4] transition-colors underline underline-offset-2 cursor-pointer"
                      >
                        Terms and Conditions
                      </span>
                      . I understand this platform is for Gordon College students only.
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { setStep(2); setError('') }} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-white/60 text-sm font-medium">
                    Back
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={loading || !agreedToTerms}
                    className="flex-1 bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-40 disabled:cursor-not-allowed transition-colors py-3 rounded-xl text-white text-sm font-medium"
                  >
                    {loading ? 'Creating account...' : isSpecsMember ? 'Join as SPECS member' : 'Create account'}
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
    </>
  )
}