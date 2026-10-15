'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Eye, EyeOff, X, ArrowRight, GraduationCap, BookOpen, Users, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isValidEmail = email.toLowerCase().endsWith('@gordoncollege.edu.ph')

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    if (!isValidEmail) {
      setError('This platform is exclusive to Gordon College students. Please use your @gordoncollege.edu.ph email.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Please try again.')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen flex">
      {/* ── LEFT ORANGE PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #F26A21 0%, #D95416 55%, #C04010 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #FFD4A8 0%, transparent 60%)', transform: 'translate(-50%, -50%)' }} />

        {/* Top — Logo */}
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

        {/* Middle — Headline */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-white/90 text-xs font-medium">Gordon College students only</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.05] tracking-tight mb-5">
            Your campus
            <br />
            learning{' '}
            <span className="text-white/60 italic font-light">partner.</span>
          </h1>

          <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-10">
            Connect with fellow students for peer tutoring, skill swaps, and academic support — all within your campus community.
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: BookOpen, label: 'Browse tutoring sessions & materials' },
              { icon: Users, label: 'Skill swap with other students' },
              { icon: CheckCircle, label: 'Free for all Gordon College students' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-white" />
                </div>
                <p className="text-white/85 text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Social proof */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">
            Trusted by Gordon College CCS students
          </p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-[#FFFCF7]">
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
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[#20251F] tracking-tight mb-1.5">Welcome back</h2>
            <p className="text-[#6B716B] text-sm">Sign in to your Mentorly account</p>
          </div>

          {/* Gordon College badge */}
          <div className="flex items-center gap-2 mb-6 bg-[#FFF0E5] border border-[#F26A21]/20 rounded-xl px-3.5 py-2.5">
            <GraduationCap size={14} className="text-[#F26A21] flex-shrink-0" />
            <p className="text-xs text-[#6B716B]">
              Exclusive to{' '}
              <span className="text-[#D95416] font-semibold">Gordon College</span>
              {' '}· @gordoncollege.edu.ph only
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
              <X size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-[#20251F] uppercase tracking-wider mb-2 block">
                Gordon College Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939A92]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gordoncollege.edu.ph"
                  className={
                    'w-full bg-white border rounded-xl pl-10 pr-4 py-3 text-[#20251F] text-sm placeholder-[#C5C8C4] transition-all ' +
                    (email
                      ? isValidEmail
                        ? 'border-green-400 focus:border-green-500'
                        : 'border-red-300 focus:border-red-400'
                      : 'border-[#E8E5DE] focus:border-[#F26A21]')
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              {email && !isValidEmail && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <X size={10} /> Must be a @gordoncollege.edu.ph email
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#20251F] uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#F26A21] hover:text-[#D95416] font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939A92]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#E8E5DE] focus:border-[#F26A21] rounded-xl pl-10 pr-10 py-3 text-[#20251F] text-sm placeholder-[#C5C8C4] transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#939A92] hover:text-[#6B716B] transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleLogin}
              disabled={loading || !email || !password || !isValidEmail}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm mt-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #F26A21 0%, #D95416 100%)' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>

          {/* Footer link */}
          <div className="mt-6 pt-6 border-t border-[#E8E5DE] text-center">
            <p className="text-[#6B716B] text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#F26A21] hover:text-[#D95416] font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-[#C5C8C4] mt-6">
            Society of Programming Enthusiasts · Gordon College
          </p>
        </div>
      </div>
    </main>
  )
}
