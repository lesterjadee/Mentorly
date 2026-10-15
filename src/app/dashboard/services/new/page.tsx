'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, AlertCircle, Briefcase } from 'lucide-react'

const CATEGORIES = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Filipino', 'History', 'Programming', 'Web Development',
  'Data Science', 'Design', 'Accounting', 'Economics', 'Other'
]

export default function NewServicePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [mode, setMode] = useState<'online' | 'in-person' | 'both'>('both')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!title || !category) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('services').insert({
      tutor_id: user.id,
      title,
      description,
      category,
      price_per_hour: 0,
      mode,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard/services')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/services"
          className="w-10 h-10 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] transition-all shadow-xs"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E7] text-[#315B3B] text-xs font-semibold mb-1">
            <Briefcase size={12} />
            Peer Service Offering
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">Create a New Service</h1>
          <p className="text-[#6B716B] text-sm mt-0.5">List a subject, course, or programming language you can tutor</p>
        </div>
      </div>

      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">
            Service Title <span className="text-[#F26A21]">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Data Structures & Algorithms Tutoring in C++"
            className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-3 text-[#20251F] text-sm placeholder-[#6B716B]/50 focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what concepts you cover, textbooks used, problem sets, and session format..."
            rows={4}
            className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-3 text-[#20251F] text-sm placeholder-[#6B716B]/50 focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">
            Category <span className="text-[#F26A21]">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-3 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
          >
            <option value="" disabled>Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-3 block">
            Session Mode <span className="text-[#F26A21]">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['online', 'in-person', 'both'] as const).map((m) => {
              const isSelected = mode === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition-all capitalize ${
                    isSelected
                      ? 'border-[#F26A21] bg-[#FFF0E5] text-[#F26A21] shadow-xs'
                      : 'border-[#E8E5DE] bg-white text-[#6B716B] hover:text-[#20251F]'
                  }`}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#F26A21] hover:bg-[#D95416] disabled:opacity-50 transition-colors py-3.5 rounded-xl text-white text-sm font-semibold mt-2 shadow-xs"
        >
          {loading ? 'Publishing Service...' : 'Publish Service Listing'}
        </button>
      </div>
    </div>
  )
}
