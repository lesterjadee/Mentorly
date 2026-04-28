'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'

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
  const [price, setPrice] = useState('')
  const [mode, setMode] = useState<'online' | 'in-person' | 'both'>('both')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!title || !category || !price) {
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
      price_per_hour: parseFloat(price),
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
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/services" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New service</h1>
          <p className="text-white/40 text-sm mt-1">List a skill you can teach</p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-5">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Service title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Calculus tutoring for Engineering students"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you'll teach, your experience, and what students can expect..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
            >
              <option value="" disabled className="bg-[#080C14]">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#080C14]">{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Price per hour (₱) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150"
              min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Session mode *</label>
          <div className="grid grid-cols-3 gap-3">
            {(['online', 'in-person', 'both'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-2.5 rounded-xl border text-sm font-medium transition-all capitalize ${
                  mode === m
                    ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
                    : 'border-white/10 text-white/40 hover:border-white/20'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium mt-2"
        >
          {loading ? 'Publishing...' : 'Publish service'}
        </button>
      </div>
    </div>
  )
}