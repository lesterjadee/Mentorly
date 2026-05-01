'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Mail, Lock, User, BookOpen, School, CheckCircle, X } from 'lucide-react'

const COURSES = [
  'Computer Science', 'Information Technology', 'Engineering', 'Business Administration',
  'Nursing', 'Education', 'Architecture', 'Accountancy', 'Psychology', 'Communication',
  'Political Science', 'Biology', 'Mathematics', 'Physics', 'Chemistry', 'Other'
]

function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* modal */}
      <div className="relative bg-[#0f1623] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-white">Terms and Conditions</h2>
            <p className="text-xs text-white/30 mt-0.5">Last updated: May 2025</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* scrollable content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 text-sm text-white/50 leading-relaxed flex-1">

          <section>
            <h3 className="text-white/80 font-medium mb-2">1. Acceptance of Terms</h3>
            <p>By creating an account and using Mentorly, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, you may not access or use the platform. Mentorly reserves the right to update these terms at any time, and continued use of the platform constitutes acceptance of any changes.</p>
          </section>

          <section>
            <h3 className="text-white/80 font-medium mb-2">2. Eligibility</h3>
            <p>Mentorly is intended for currently enrolled college and university students. By registering, you confirm that you are a student at an accredited academic institution. Misrepresentation of your academic status may result in immediate account suspension.</p>
          </section>

          <section>
            <h3 className="text-white/80 font-medium mb-2">3. User Accounts</h3>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration. Mentorly is not liable for any loss or damage arising from unauthorized access to your account due to your failure to keep your login information secure.</p>
          </section>

          <section>
            <h3 className="text-white/80 font-medium mb-2">4. Tutor and Learner Responsibilities</h3>
            <p className="mb-2">As a tutor, you agree to provide honest and accurate descriptions of your skills, qualifications, and services. You commit to fulfilling accepted bookings in a professional and timely manner.</p>
            <p>As a learner, you agree to treat tutors with respect and to honor scheduled sessions. Repeated no-shows or abusive behavior may result in account restrictions.</p>
          </section>

          <section>
            <h3 className="text-white/80 font-medium mb-2">5. Session Bookings and Cancellations</h3>
            <p>Sessions are arranged directly between tutors and learners through the platform. Both parties are expected to communicate promptly regarding scheduling changes. Mentorly is not responsible for disputes arising from cancelled or missed sessions, but may intervene in cases of reported misconduct.</p>
          </section>

          <section>
            <h3 className="text-white/80 font-medium mb-2">6. Payments and Pricing</h3>
            <p>Tutors set their own rates on the platform. All financial transactions between users are the sole responsibility of those involved. Mentorly does not process, hold, or guarantee payments between users at this time. Users are encouraged to agree on payment terms before a session begins.</p>
          </section>

          <section>
            <h3 className="text-white/80 font-medium mb-2">7. Reviews and Trust Scores</h3>
            <p>Users may leave honest reviews after completed sessions. Reviews must be truthful and based on actual experience. Fake, malicious, or retaliatory reviews are prohibited and may be removed. Trust scores are calculated automatically based on submitted ratings.</p>
          </section>

          <section>
            <h3 className="text-white/80 font-medium mb-2">8. Prohibited Conduct</h3>
            <p>Users may not use Mentorly to engage in academic dishonesty, harassment, discrimination, or any unlawful activity. Sharing false information, impersonating others, or attempting to manipulate the review system is strictly prohibited and may result in permanent account termination.</p>
          </section>

          <section>
            <h3 className="text-white/80 font-medium mb-2">9. Privacy and Data</h3>
            <p>Mentorly collects basic profile information to facilitate connections between students. Your data will not be sold to third parties. By using the platform, you consent to the storage and processing of your information as necessary to provide our services.</p>
          </section>

          <section>
            <h3 className="text-white/80 font-medium mb-2">10. Limitation of Liability</h3>
            <p>Mentorly is a student-to-student marketplace and does not guarantee the quality, accuracy, or outcomes of any tutoring session. The platform is provided on an "as is" basis. Mentorly shall not be held liable for any direct, indirect, or consequential damages arising from use of the platform.</p>
          </section>

          <section>
            <h3 className="text-white/80 font-medium mb-2">11. Termination</h3>
            <p>Mentorly reserves the right to suspend or permanently terminate any account that violates these Terms and Conditions without prior notice. Users may also delete their accounts at any time by contacting support.</p>
          </section>

          <section>
            <h3 className="text-white/80 font-medium mb-2">12. Contact</h3>
            <p>If you have questions about these terms, please reach out through the platform's messaging system or contact your institution's student services office.</p>
          </section>
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-white/8 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-[#26619C] hover:bg-[#1e4f82] transition-colors py-2.5 rounded-xl text-white text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [school, setSchool] = useState('')
  const [course, setCourse] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  async function handleRegister() {
    if (!agreedToTerms) {
      setError('You must agree to the Terms and Conditions to continue.')
      return
    }
    if (!fullName || !school || !course || !email || !password) {
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
        data: { full_name: fullName, school, course, role: 'both' },
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
              <span className="font-semibold text-white text-[15px]">Mentorly</span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-white/40 text-sm">Join thousands of students on Mentorly</p>
          </div>

          {/* step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ' +
                  (step >= s ? 'bg-[#26619C] text-white' : 'bg-white/5 text-white/30')
                }>{s}</div>
                {s < 2 && <div className={'w-12 h-px transition-colors ' + (step > s ? 'bg-[#26619C]' : 'bg-white/10')} />}
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
                    if (!fullName || !school || !course) {
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

                {/* terms checkbox — fixed clickability */}
                <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                  <div
                    className="flex items-start gap-3 cursor-pointer select-none"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                  >
                    {/* custom checkbox */}
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
                      . I understand that Mentorly is a peer-to-peer platform and I will conduct myself professionally.
                    </span>
                  </div>
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
                    disabled={loading || !agreedToTerms}
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
    </>
  )
}