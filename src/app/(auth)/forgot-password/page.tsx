'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

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
      <main className="min-h-screen bg-[#080C14] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-[#26619C]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
          <p className="text-white/40 text-sm leading-relaxed mb-2">
            We sent a password reset link to
          </p>
          <p className="text-white/70 text-sm font-medium mb-6">{email}</p>
          <p className="text-white/30 text-xs mb-8">
            Click the link in the email to reset your password. If you don't see it, check your spam folder.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#080C14] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

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
          <h1 className="text-2xl font-bold text-white mb-2">Forgot your password?</h1>
          <p className="text-white/40 text-sm">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-8">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                Email address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  placeholder="you@university.edu"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium"
            >
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-white/30 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft size={13} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}