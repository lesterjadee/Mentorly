'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [validSession, setValidSession] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // supabase puts the token in the URL hash — check for active session
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true)
      }
      setChecking(false)
    })
  }, [])

  async function handleReset() {
    if (!password || !confirmPassword) {
      setError('Please fill in both fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-[#080C14] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#26619C] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!validSession) {
    return (
      <main className="min-h-screen bg-[#080C14] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock size={24} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Link expired</h1>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] transition-colors px-5 py-2.5 rounded-xl text-sm font-medium text-white"
          >
            Request new link
          </Link>
        </div>
      </main>
    )
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[#080C14] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-[#26619C]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Password updated!</h1>
          <p className="text-white/40 text-sm leading-relaxed mb-2">
            Your password has been successfully changed.
          </p>
          <p className="text-white/20 text-xs">Redirecting you to sign in...</p>
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
          <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
          <p className="text-white/40 text-sm">Choose a strong password for your account</p>
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
                New password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-white/20 text-xs mt-2">Minimum 6 characters</p>
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                Confirm new password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs mt-2">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && password.length >= 6 && (
                <p className="text-green-400 text-xs mt-2">Passwords match!</p>
              )}
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium mt-2"
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}