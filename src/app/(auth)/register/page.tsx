'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  GraduationCap, Mail, Lock, User,
  School, CheckCircle, X,
  Eye, EyeOff, KeyRound, ShieldCheck, ArrowRight, ArrowLeft, BookOpen, Users
} from 'lucide-react'

const COURSE = 'Computer Science'

function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#E8E5DE] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5DE] flex-shrink-0">
          <div>
            <h2 className="font-bold text-[#20251F]">Terms and Conditions</h2>
            <p className="text-xs text-[#939A92] mt-0.5">Last updated: 2025</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#F5F3ED] hover:bg-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-6 text-sm text-[#6B716B] leading-relaxed flex-1">
          <section>
            <h3 className="text-[#20251F] font-semibold mb-2">1. Acceptance of Terms</h3>
            <p>By creating an account and using this platform, you agree to be bound by these Terms and Conditions.</p>
          </section>
          <section>
            <h3 className="text-[#20251F] font-semibold mb-2">2. Eligibility</h3>
            <p>This platform is exclusively available to currently enrolled students of Gordon College with a valid @gordoncollege.edu.ph email address.</p>
          </section>
          <section>
            <h3 className="text-[#20251F] font-semibold mb-2">3. SPECS Members</h3>
            <p>Members of the Society of Programming Enthusiasts (SPECS) who register with a valid invite code are granted additional privileges including posting academic sessions and uploading study materials.</p>
          </section>
          <section>
            <h3 className="text-[#20251F] font-semibold mb-2">4. Academic Integrity</h3>
            <p>All sessions and materials shared on this platform must be used for legitimate academic purposes. Any form of academic dishonesty is strictly prohibited.</p>
          </section>
          <section>
            <h3 className="text-[#20251F] font-semibold mb-2">5. User Responsibilities</h3>
            <p>Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>
          </section>
          <section>
            <h3 className="text-[#20251F] font-semibold mb-2">6. Study Materials</h3>
            <p>Materials uploaded by SPECS members are shared for educational purposes. Redistribution outside the platform is not permitted.</p>
          </section>
          <section>
            <h3 className="text-[#20251F] font-semibold mb-2">7. Sessions</h3>
            <p>All tutoring and academic support sessions facilitated through this platform are provided free of charge by SPECS members as a service to the Gordon College community.</p>
          </section>
          <section>
            <h3 className="text-[#20251F] font-semibold mb-2">8. Privacy</h3>
            <p>Basic profile information is collected to facilitate academic connections. Your data will not be shared with third parties.</p>
          </section>
          <section>
            <h3 className="text-[#20251F] font-semibold mb-2">9. Limitation of Liability</h3>
            <p>This platform is provided on an &quot;as is&quot; basis. SPECS and Gordon College shall not be held liable for any damages arising from use of the platform.</p>
          </section>
        </div>
        <div className="px-6 py-4 border-t border-[#E8E5DE] flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #F26A21 0%, #D95416 100%)' }}
          >
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
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  const labels = ['Too weak', 'Weak', 'Almost there', 'Strong']
  if (!password) return null
  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={'h-1.5 flex-1 rounded-full transition-all duration-300 ' + (passed > i ? colors[passed] : 'bg-[#E8E5DE]')} />
        ))}
      </div>
      <p className={'text-xs ' + (passed === 3 ? 'text-green-600' : 'text-[#939A92]')}>{labels[passed]}</p>
      <div className="space-y-1">
        {[
          { label: 'At least 8 characters', ok: checks.length },
          { label: 'At least 1 uppercase letter (A–Z)', ok: checks.capital },
          { label: 'At least 1 symbol (!@#$%^&*...)', ok: checks.symbol },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-2">
            {c.ok ? <CheckCircle size={11} className="text-green-500 flex-shrink-0" /> : <X size={11} className="text-[#C5C8C4] flex-shrink-0" />}
            <span className={'text-xs ' + (c.ok ? 'text-green-600' : 'text-[#939A92]')}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const inviteCodeRef = useRef('')
  const [showInviteCode, setShowInviteCode] = useState(false)
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [isSpecsMember, setIsSpecsMember] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const normalizedEmail = email.trim().toLowerCase()
  const isValidEmail = /^[^@\s]+@gordoncollege\.edu\.ph$/.test(normalizedEmail)
  const isValidPassword =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)

  async function checkInviteCode() {
    const code = inviteCode.trim()
    if (!code) return
    setCodeStatus('checking')
    const supabase = createClient()
    const { data, error: inviteError } = await supabase.rpc('validate_specs_invite', { invite_code: code })
    if (inviteCodeRef.current.trim() !== code) return

    if (inviteError) {
      setCodeStatus('idle')
      setIsSpecsMember(false)
      setError('Unable to verify the SPECS code. Please try again.')
    } else if (data === true) {
      setCodeStatus('valid')
      setIsSpecsMember(true)
    } else {
      setCodeStatus('invalid')
      setIsSpecsMember(false)
    }
  }

  async function handleRegister() {
    if (loading || codeStatus === 'checking') return
    if (!agreedToTerms) { setError('You must agree to the Terms and Conditions.'); return }
    if (!fullName.trim() || !normalizedEmail || !password) { setError('Please fill in all fields.'); return }
    if (!isValidEmail) { setError('Only @gordoncollege.edu.ph emails are allowed.'); return }
    if (!isValidPassword) { setError('Password must be at least 8 characters, include 1 uppercase letter and 1 symbol.'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const code = inviteCode.trim()
    if (code) {
      const { data, error: inviteError } = await supabase.rpc('validate_specs_invite', { invite_code: code })
      if (inviteError || data !== true) {
        setCodeStatus(inviteError ? 'idle' : 'invalid')
        setIsSpecsMember(false)
        setError(inviteError ? 'Unable to verify the SPECS code. Please try again.' : 'Invalid SPECS invite code. Correct it or clear the field to register as a regular student.')
        setLoading(false)
        return
      }
      setIsSpecsMember(true)
      setCodeStatus('valid')
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          school: 'Gordon College',
          course: COURSE,
          ...(code ? { specs_invite_code: code } : {}),
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  // Orange panel content per step
  const stepPanelContent = [
    {
      icon: User,
      headline: 'Join your campus\ncommunity.',
      sub: 'Create your Mentorly account to connect with peers, book tutoring sessions, and access study materials — all within Gordon College.',
    },
    {
      icon: Lock,
      headline: 'Secure your\naccount.',
      sub: 'Use your Gordon College email and set a strong password to keep your account safe and exclusive to verified students.',
    },
    {
      icon: ShieldCheck,
      headline: 'Almost\nthere!',
      sub: 'Optionally enter your SPECS invite code to unlock tutor-level features, or register as a regular student and start learning today.',
    },
  ]

  const panel = stepPanelContent[step - 1]
  const PanelIcon = panel.icon

  // Success screen
  if (success) {
    return (
      <main className="min-h-screen flex">
        <div
          className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #F26A21 0%, #D95416 55%, #C04010 100%)' }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Image src="/specs-logo.png" alt="SPECS" width={28} height={28} className="object-contain" priority />
              </div>
              <div>
                <p className="font-black text-white text-base tracking-tight leading-none">Mentorly</p>
                <p className="text-white/60 text-[11px] mt-0.5">by SPECS · Gordon College</p>
              </div>
            </Link>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-6">
              {isSpecsMember ? <ShieldCheck size={26} className="text-white" /> : <CheckCircle size={26} className="text-white" />}
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              {isSpecsMember ? 'Welcome, SPECS\nmember!' : 'Account\ncreated!'}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              {isSpecsMember
                ? 'You\'ve been registered with SPECS member privileges. You can post sessions and upload study materials.'
                : 'Your account is ready. Verify your email to start accessing Mentorly\'s full features.'}
            </p>
          </div>
          <div className="relative z-10">
            <p className="text-white/40 text-xs">Society of Programming Enthusiasts · Gordon College</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-[#FFFCF7]">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#F26A21]/30" style={{ background: 'linear-gradient(135deg, #FFF0E5, #FFE0CC)' }}>
              {isSpecsMember
                ? <ShieldCheck className="text-[#F26A21]" size={28} />
                : <CheckCircle className="text-[#F26A21]" size={28} />
              }
            </div>
            <h1 className="text-2xl font-black text-[#20251F] mb-3">
              {isSpecsMember ? 'Welcome to SPECS!' : 'Check your email'}
            </h1>
            {isSpecsMember && (
              <div className="mb-4 bg-[#FFF0E5] border border-[#F26A21]/25 rounded-xl px-4 py-3">
                <p className="text-[#D95416] text-xs font-medium">
                  🎉 You&apos;ve been registered as a SPECS member. Your account has elevated privileges.
                </p>
              </div>
            )}
            <p className="text-[#6B716B] text-sm leading-relaxed mb-6">
              We sent a confirmation link to{' '}
              <span className="text-[#20251F] font-medium">{email}</span>.
              Click it to activate your account.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-[#F26A21] hover:text-[#D95416] text-sm font-semibold transition-colors">
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      <main className="min-h-screen flex">
        {/* ── LEFT ORANGE PANEL ── */}
        <div
          className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #F26A21 0%, #D95416 55%, #C04010 100%)' }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #FFD4A8 0%, transparent 60%)', transform: 'translate(-50%, -50%)' }} />

          {/* Logo */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Image src="/specs-logo.png" alt="SPECS" width={28} height={28} className="object-contain" priority />
              </div>
              <div>
                <p className="font-black text-white text-base tracking-tight leading-none">Mentorly</p>
                <p className="text-white/60 text-[11px] mt-0.5">by SPECS · Gordon College</p>
              </div>
            </Link>
          </div>

          {/* Dynamic content per step */}
          <div className="relative z-10 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-8">
              <PanelIcon size={26} className="text-white" />
            </div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3 py-1.5 mb-6">
              <span className="text-white/90 text-xs font-medium">Step {step} of 3</span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.05] tracking-tight mb-5 whitespace-pre-line">
              {panel.headline.split('\n').map((line, i) => (
                i === 1 ? <span key={i}><span className="text-white/60 italic font-light">{line}</span></span> : <span key={i}>{line}<br /></span>
              ))}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-10">{panel.sub}</p>

            {/* Feature pills - shown on step 1 */}
            {step === 1 && (
              <div className="space-y-3">
                {[
                  { icon: BookOpen, label: 'Browse & book tutoring sessions' },
                  { icon: Users, label: 'Skill swap with other students' },
                  { icon: CheckCircle, label: 'Free for all GC students' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-white" />
                    </div>
                    <p className="text-white/85 text-xs font-medium">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step dots */}
          <div className="relative z-10 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={'h-1.5 rounded-full transition-all duration-300 ' + (s === step ? 'w-6 bg-white' : s < step ? 'w-3 bg-white/60' : 'w-3 bg-white/25')}
              />
            ))}
            <span className="text-white/40 text-xs ml-2">Step {step}/3</span>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-[#FFFCF7] overflow-y-auto">
          <div className="w-full max-w-sm">

            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F26A21, #D95416)' }}>
                  <Image src="/specs-logo.png" alt="SPECS" width={24} height={24} className="object-contain" priority />
                </div>
                <span className="font-black text-[#20251F] text-base tracking-tight">Mentorly</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-black text-[#20251F] tracking-tight mb-1">Create your account</h1>
              <p className="text-[#6B716B] text-sm">Gordon College Computer Science Academic Support</p>
            </div>

            {/* Gordon College badge */}
            <div className="flex items-center gap-2 mb-5 bg-[#FFF0E5] border border-[#F26A21]/20 rounded-xl px-3.5 py-2.5">
              <GraduationCap size={14} className="text-[#F26A21] flex-shrink-0" />
              <p className="text-xs text-[#6B716B]">
                Requires a{' '}
                <span className="text-[#D95416] font-semibold">@gordoncollege.edu.ph</span>{' '}
                email to register
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-7">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ' +
                      (step >= s
                        ? 'text-white'
                        : 'bg-[#F5F3ED] text-[#939A92]')
                    }
                    style={step >= s ? { background: 'linear-gradient(135deg, #F26A21, #D95416)' } : {}}
                  >
                    {step > s ? '✓' : s}
                  </div>
                  {s < 3 && (
                    <div className={'w-8 h-0.5 rounded-full transition-colors ' + (step > s ? 'bg-[#F26A21]' : 'bg-[#E8E5DE]')} />
                  )}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
                <X size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* ── STEP 1 — personal info ── */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-[#939A92] uppercase tracking-wider mb-5">Step 1 — Personal information</p>

                <div>
                  <label className="text-xs font-semibold text-[#20251F] uppercase tracking-wider mb-2 block">Full name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939A92]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Juan dela Cruz"
                      className="w-full bg-white border border-[#E8E5DE] focus:border-[#F26A21] rounded-xl pl-10 pr-4 py-3 text-[#20251F] text-sm placeholder-[#C5C8C4] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#20251F] uppercase tracking-wider mb-2 block">School</label>
                  <div className="relative">
                    <School size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939A92]" />
                    <div className="w-full bg-[#F5F3ED] border border-[#E8E5DE] rounded-xl pl-10 pr-4 py-3 text-[#6B716B] text-sm">
                      Gordon College
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!fullName) { setError('Please enter your full name.'); return }
                    setError(''); setStep(2)
                  }}
                  className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm mt-2 transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #F26A21 0%, #D95416 100%)' }}
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* ── STEP 2 — credentials ── */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-[#939A92] uppercase tracking-wider mb-5">Step 2 — Account credentials</p>

                <div>
                  <label className="text-xs font-semibold text-[#20251F] uppercase tracking-wider mb-2 block">Gordon College email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939A92]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gordoncollege.edu.ph"
                      className={
                        'w-full bg-white border rounded-xl pl-10 pr-4 py-3 text-[#20251F] text-sm placeholder-[#C5C8C4] transition-all ' +
                        (email ? (isValidEmail ? 'border-green-400' : 'border-red-300') : 'border-[#E8E5DE] focus:border-[#F26A21]')
                      }
                    />
                  </div>
                  {email && !isValidEmail && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><X size={11} />Must be a @gordoncollege.edu.ph email</p>
                  )}
                  {email && isValidEmail && (
                    <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1"><CheckCircle size={11} />Valid Gordon College email</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#20251F] uppercase tracking-wider mb-2 block">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939A92]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                      className={
                        'w-full bg-white border rounded-xl pl-10 pr-10 py-3 text-[#20251F] text-sm placeholder-[#C5C8C4] transition-all ' +
                        (password ? (isValidPassword ? 'border-green-400' : 'border-orange-300') : 'border-[#E8E5DE] focus:border-[#F26A21]')
                      }
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#939A92] hover:text-[#6B716B] transition-colors">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => { setStep(1); setError('') }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-[#F5F3ED] border border-[#E8E5DE] transition-colors py-3.5 rounded-xl text-[#6B716B] text-sm font-medium"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    onClick={() => {
                      if (!isValidEmail) { setError('Please enter a valid @gordoncollege.edu.ph email.'); return }
                      if (!isValidPassword) { setError('Password does not meet requirements.'); return }
                      setError(''); setStep(3)
                    }}
                    disabled={!isValidEmail || !isValidPassword}
                    className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-40 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #F26A21 0%, #D95416 100%)' }}
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3 — SPECS code + terms ── */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-[#939A92] uppercase tracking-wider mb-5">Step 3 — SPECS membership (optional)</p>

                {/* SPECS invite code */}
                <div className="bg-[#FFF0E5] border border-[#F26A21]/20 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <ShieldCheck size={16} className="text-[#F26A21] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[#20251F]">Are you a SPECS member?</p>
                      <p className="text-xs text-[#6B716B] mt-0.5 leading-relaxed">
                        Enter your SPECS invite code to unlock session management and study material uploads. Leave blank if you&apos;re a regular student.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowInviteCode(!showInviteCode)}
                    className={
                      'w-full py-2.5 rounded-xl text-xs font-semibold border transition-all ' +
                      (showInviteCode
                        ? 'bg-[#F26A21]/10 border-[#F26A21]/30 text-[#D95416]'
                        : 'bg-white border-[#E8E5DE] text-[#6B716B] hover:text-[#20251F] hover:border-[#C5C8C4]')
                    }
                  >
                    {showInviteCode ? 'Hide SPECS code field' : 'I have a SPECS invite code'}
                  </button>

                  {showInviteCode && (
                    <div className="mt-3 space-y-2">
                      <div className="relative">
                        <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#939A92]" />
                        <input
                          type="text"
                          value={inviteCode}
                          onChange={(e) => { const code = e.target.value.toUpperCase(); inviteCodeRef.current = code; setInviteCode(code); setCodeStatus('idle'); setIsSpecsMember(false) }}
                          disabled={loading}
                          placeholder="Enter SPECS invite code"
                          className={
                            'w-full bg-white border rounded-xl pl-9 pr-4 py-2.5 text-[#20251F] text-sm placeholder-[#C5C8C4] transition-all uppercase tracking-wider ' +
                            (codeStatus === 'valid' ? 'border-green-400' :
                             codeStatus === 'invalid' ? 'border-red-300' :
                             'border-[#E8E5DE] focus:border-[#F26A21]')
                          }
                        />
                      </div>
                      <button
                        onClick={checkInviteCode}
                        disabled={loading || !inviteCode.trim() || codeStatus === 'checking'}
                        className="w-full py-2 bg-white hover:bg-[#F5F3ED] border border-[#E8E5DE] rounded-xl text-xs font-medium text-[#6B716B] hover:text-[#20251F] transition-all disabled:opacity-40"
                      >
                        {codeStatus === 'checking' ? 'Verifying...' : 'Verify code'}
                      </button>

                      {codeStatus === 'valid' && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <ShieldCheck size={13} className="text-green-600" />
                          <p className="text-green-700 text-xs font-medium">Valid SPECS code — you&apos;ll be registered as a SPECS member</p>
                        </div>
                      )}
                      {codeStatus === 'invalid' && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          <X size={13} className="text-red-500" />
                          <p className="text-red-600 text-xs">Invalid code. Please check with your SPECS officer.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Role comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={
                    'rounded-xl p-3 border text-center transition-all ' +
                    (!isSpecsMember ? 'border-[#F26A21]/30 bg-[#FFF0E5]' : 'border-[#E8E5DE] bg-[#F5F3ED]')
                  }>
                    <p className="text-xs font-semibold text-[#20251F] mb-1">Regular Student</p>
                    <p className="text-[10px] text-[#939A92] leading-relaxed">Browse sessions · Book sessions · Post requests · Message</p>
                  </div>
                  <div className={
                    'rounded-xl p-3 border text-center transition-all ' +
                    (isSpecsMember ? 'border-[#F26A21]/30 bg-[#FFF0E5]' : 'border-[#E8E5DE] bg-[#F5F3ED]')
                  }>
                    <p className="text-xs font-semibold text-[#D95416] mb-1">SPECS Member ⚡</p>
                    <p className="text-[10px] text-[#939A92] leading-relaxed">All above + Post sessions + Upload study materials</p>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-white border border-[#E8E5DE] rounded-xl p-4">
                  <div
                    className="flex items-start gap-3 cursor-pointer select-none"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all ' +
                        (agreedToTerms ? 'border-[#F26A21]' : 'border-[#C5C8C4] bg-transparent')
                      }
                      style={agreedToTerms ? { background: 'linear-gradient(135deg, #F26A21, #D95416)' } : {}}
                      >
                        {agreedToTerms && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-[#6B716B] leading-relaxed">
                      I have read and agree to the{' '}
                      <span
                        onClick={(e) => { e.stopPropagation(); setShowTerms(true) }}
                        className="text-[#F26A21] hover:text-[#D95416] transition-colors underline underline-offset-2 cursor-pointer font-medium"
                      >
                        Terms and Conditions
                      </span>
                      . I understand this platform is for Gordon College students only.
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep(2); setError('') }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-[#F5F3ED] border border-[#E8E5DE] transition-colors py-3.5 rounded-xl text-[#6B716B] text-sm font-medium"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={loading || codeStatus === 'checking' || !agreedToTerms}
                    className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #F26A21 0%, #D95416 100%)' }}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      isSpecsMember ? 'Join as SPECS member' : 'Create account'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Footer link */}
            <div className="mt-6 pt-6 border-t border-[#E8E5DE] text-center">
              <p className="text-[#6B716B] text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-[#F26A21] hover:text-[#D95416] font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            <p className="text-center text-xs text-[#C5C8C4] mt-4">
              Society of Programming Enthusiasts · Gordon College
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
