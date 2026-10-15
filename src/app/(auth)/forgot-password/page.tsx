'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft, CheckCircle, ArrowRight, GraduationCap, Lock, KeyRound } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset() {
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen flex">
        {/* Orange panel */}
        <div
          className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-center p-10 xl:p-14 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #F26A21 0%, #D95416 55%, #C04010 100%)' }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-16">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Image src="/specs-logo.png" alt="SPECS" width={28} height={28} className="object-contain" priority />
              </div>
              <div>
                <p className="font-black text-white text-base tracking-tight leading-none">Mentorly</p>
                <p className="text-white/60 text-[11px] mt-0.5">by SPECS · Gordon College</p>
              </div>
            </Link>

            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-6">
              <CheckCircle size={26} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white leading-tight mb-4">Email sent!</h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Check your inbox for the password reset link. It may take a minute to arrive.
            </p>
          </div>
        </div>

        {/* Right success panel */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-[#FFFCF7]">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#F26A21]/30" style={{ background: 'linear-gradient(135deg, #FFF0E5, #FFE0CC)' }}>
              <CheckCircle size={28} className="text-[#F26A21]" />
            </div>
            <h1 className="text-2xl font-black text-[#20251F] mb-3">Check your email</h1>
            <p className="text-[#6B716B] text-sm leading-relaxed mb-2">
              We sent a password reset link to
            </p>
            <p className="text-[#20251F] text-sm font-semibold mb-6">{email}</p>
            <p className="text-[#939A92] text-xs mb-8">
              Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#F26A21] hover:text-[#D95416] text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex">
      {/* ── LEFT ORANGE PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #F26A21 0%, #D95416 55%, #C04010 100%)' }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #FFFFFF 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

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

        {/* Middle */}
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-8">
            <KeyRound size={26} className="text-white" />
          </div>
          <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-5">
            Reset your
            <br />
            <span className="text-white/60 italic font-light">password.</span>
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Enter your Gordon College email and we&apos;ll send you a secure link to reset your password.
          </p>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">Mentorly · Academic Support Platform</p>
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

          {/* Back link */}
          <Link href="/login" className="inline-flex items-center gap-1.5 text-[#6B716B] hover:text-[#20251F] text-sm transition-colors mb-8">
            <ArrowLeft size={14} />
            Back to sign in
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #FFF0E5, #FFE0CC)' }}>
              <GraduationCap size={22} className="text-[#F26A21]" />
            </div>
            <h1 className="text-2xl font-black text-[#20251F] tracking-tight mb-1.5">Forgot your password?</h1>
            <p className="text-[#6B716B] text-sm">Enter your email and we&apos;ll send you a reset link</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#20251F] uppercase tracking-wider mb-2 block">
                Email address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939A92]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  placeholder="yourname@gordoncollege.edu.ph"
                  className="w-full bg-white border border-[#E8E5DE] focus:border-[#F26A21] rounded-xl pl-10 pr-4 py-3 text-[#20251F] text-sm placeholder-[#C5C8C4] transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #F26A21 0%, #D95416 100%)' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending reset link...
                </>
              ) : (
                <>
                  Send reset link
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-[#E8E5DE] text-center">
            <p className="text-[#6B716B] text-sm">
              Remember your password?{' '}
              <Link href="/login" className="text-[#F26A21] hover:text-[#D95416] font-semibold transition-colors">
                Sign in
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