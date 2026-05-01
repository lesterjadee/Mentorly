'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Trash2 } from 'lucide-react'

const CATEGORIES = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Filipino', 'History', 'Programming', 'Web Development',
  'Data Science', 'Design', 'Accounting', 'Economics', 'Other'
]

export default function EditServicePage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [mode, setMode] = useState<'online' | 'in-person' | 'both'>('both')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function fetchService() {
      const supabase = createClient()
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single()

      if (data) {
        setTitle(data.title)
        setDescription(data.description || '')
        setCategory(data.category)
        setPrice(data.price_per_hour.toString())
        setMode(data.mode)
        setIsActive(data.is_active)
      }
      setFetching(false)
    }
    fetchService()
  }, [serviceId])

  async function handleUpdate() {
    if (!title || !category || !price) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase
      .from('services')
      .update({
        title,
        description,
        category,
        price_per_hour: parseFloat(price),
        mode,
        is_active: isActive,
      })
      .eq('id', serviceId)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard/services')
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this service? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('services').delete().eq('id', serviceId)
    router.push('/dashboard/services')
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#26619C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/services" className="text-white/30 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit service</h1>
            <p className="text-white/40 text-sm mt-1">Update your listing</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Trash2 size={13} />
          {deleting ? 'Deleting...' : 'Delete service'}
        </button>
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
                className={
                  'py-2.5 rounded-xl border text-sm font-medium transition-all capitalize ' +
                  (mode === m
                    ? 'border-[#26619C] bg-[#26619C]/10 text-[#4a8fd4]'
                    : 'border-white/10 text-white/40 hover:border-white/20')
                }
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* active toggle */}
        <div className="flex items-center justify-between bg-white/3 border border-white/8 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium">Listing status</p>
            <p className="text-xs text-white/30 mt-0.5">Inactive listings won't appear in the marketplace</p>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={
              'w-11 h-6 rounded-full border transition-all duration-200 relative ' +
              (isActive ? 'bg-[#26619C] border-[#26619C]' : 'bg-white/5 border-white/10')
            }
          >
            <div className={
              'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ' +
              (isActive ? 'left-5' : 'left-0.5')
            } />
          </button>
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-medium"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}