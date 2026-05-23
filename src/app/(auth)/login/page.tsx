'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Eye, EyeOff, X, GraduationCap } from 'lucide-react'

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
      setError('Mentorly is exclusive to Gordon College students. Please use your @gordoncollege.edu.ph email.')
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
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/40 text-sm">Sign in to your Mentorly account</p>
        </div>

        {/* gordon college badge */}
        <div className="flex items-center justify-center gap-2 mb-6 bg-[#26619C]/5 border border-[#26619C]/20 rounded-xl px-4 py-3">
          <GraduationCap size={15} className="text-[#4a8fd4] flex-shrink-0" />
          <p className="text-xs text-white/50 text-center">
            Exclusive to{' '}
            <span className="text-[#4a8fd4] font-semibold">Gordon College</span>{' '}
            students only
          </p>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-8">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
              <X size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">

            {/* email */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/40 uppercase tracking-wider">
                  Gordon College email
                </label>
              </div>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gordoncollege.edu.ph"
                  className={
                    'w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none transition-colors ' +
                    (email
                      ? isValidEmail
                        ? 'border-green-500/30 focus:border-green-500/50'
                        : 'border-red-500/30 focus:border-red-500/50'
                      : 'border-white/10 focus:border-[#26619C]/60')
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              {email && !isValidEmail && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <X size={10} />
                  Must be a @gordoncollege.edu.ph email
                </p>
              )}
            </div>

            {/* password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/40 uppercase tracking-wider">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#26619C] hover:text-[#4a8fd4] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password || !isValidEmail}
              className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-40 disabled:cursor-not-allowed transition-colors py-3 rounded-xl text-white text-sm font-medium mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <p className="text-white/30 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#26619C] hover:text-[#4a8fd4] transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}