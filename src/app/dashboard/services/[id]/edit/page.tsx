'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react'

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
        setMode(data.mode)
        setIsActive(data.is_active)
      }
      setFetching(false)
    }
    fetchService()
  }, [serviceId])

  async function handleUpdate() {
    if (!title || !category) {
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
        price_per_hour: 0,
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
        <div className="w-8 h-8 border-3 border-[#F26A21] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/services"
            className="w-9 h-9 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-center text-[#6B716B] hover:text-[#20251F] transition-all shadow-xs"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#20251F] tracking-tight leading-tight">Edit Service</h1>
            <p className="text-[#6B716B] text-xs mt-0.5">Update your peer tutoring offering</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 shadow-xs"
        >
          <Trash2 size={13} />
          {deleting ? 'Deleting...' : 'Delete listing'}
        </button>
      </div>

      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-1.5 block">
                Service Title <span className="text-[#F26A21]">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all resize-none"
              />
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-1.5 block">
                  Category <span className="text-[#F26A21]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">
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

              {/* Active Toggle */}
              <div className="flex items-center justify-between bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-3.5">
                <div>
                  <p className="text-sm font-bold text-[#20251F]">Listing Status</p>
                  <p className="text-xs text-[#6B716B] mt-0.5">Inactive listings won't appear to students in the marketplace</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={
                    'w-12 h-7 rounded-full border transition-all duration-200 relative flex-shrink-0 ' +
                    (isActive ? 'bg-[#315B3B] border-[#315B3B]' : 'bg-[#E8E5DE] border-[#E8E5DE]')
                  }
                >
                  <div className={
                    'absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all duration-200 shadow-xs ' +
                    (isActive ? 'left-5' : 'left-0.5')
                  } />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-[#F26A21] hover:bg-[#D95416] disabled:opacity-50 transition-colors py-3 rounded-xl text-white text-sm font-semibold shadow-xs"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
