'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Upload, X, FileText,
  Shield, AlertCircle, BookOpen, CheckCircle2
} from 'lucide-react'

const SUBJECTS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'Programming', 'Web Development', 'English', 'Filipino', 'History',
  'Accounting', 'Economics', 'Other'
]

function getFileEmoji(file: File): string {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  if (type.includes('pdf') || name.endsWith('.pdf')) return '📄'
  if (name.endsWith('.doc') || name.endsWith('.docx')) return '📝'
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return '📊'
  if (name.endsWith('.xls') || name.endsWith('.xlsx')) return '📈'
  if (type.startsWith('image/')) return '🖼️'
  return '📁'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function UploadMaterialPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSpecsMember, setIsSpecsMember] = useState<boolean | null>(null)
  const [userId, setUserId] = useState('')
  const [sessions, setSessions] = useState<any[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [linkedSession, setLinkedSession] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('users')
        .select('is_specs_member')
        .eq('id', user.id)
        .single()

      const isMember = profile?.is_specs_member || false
      setIsSpecsMember(isMember)

      if (isMember) {
        const { data: mySessions } = await supabase
          .from('services')
          .select('id, title')
          .eq('tutor_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        setSessions(mySessions || [])
      }
    }
    load()
  }, [router])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      setError('File must be under 50MB.')
      return
    }
    setSelectedFile(file)
    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
    }
  }

  async function handleUpload() {
    if (!title.trim()) { setError('Please enter a title.'); return }
    if (!subject) { setError('Please select a subject.'); return }
    if (!selectedFile) { setError('Please select a file to upload.'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const ext = selectedFile.name.split('.').pop()
    const filePath = userId + '/standalone/' + Date.now() + '.' + ext

    const { error: uploadError } = await supabase.storage
      .from('study-materials')
      .upload(filePath, selectedFile)

    if (uploadError) {
      setError('Failed to upload file: ' + uploadError.message)
      setLoading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('study-materials')
      .getPublicUrl(filePath)

    const { error: dbError } = await supabase.from('study_materials').insert({
      uploaded_by: userId,
      session_id: linkedSession || null,
      title: title.trim(),
      description: description.trim() || null,
      subject,
      file_url: urlData.publicUrl,
      file_name: selectedFile.name,
      file_type: selectedFile.type,
      file_size: selectedFile.size,
      download_count: 0,
    })

    if (dbError) {
      setError('Failed to save material: ' + dbError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/materials?uploaded=true')
  }

  if (isSpecsMember === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#F26A21] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isSpecsMember) {
    return (
      <div className="max-w-lg mx-auto pt-10">
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertCircle size={24} />
          </div>
          <h2 className="font-extrabold text-xl text-[#20251F] mb-2">SPECS Members Only</h2>
          <p className="text-[#6B716B] text-xs leading-relaxed mb-6">
            Only verified SPECS mentors and officers can upload study materials. Please contact an officer to verify your membership status.
          </p>
          <Link
            href="/dashboard/materials"
            className="inline-flex items-center justify-center bg-[#F26A21] hover:bg-[#D95416] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Browse Study Materials
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/materials"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B716B] hover:text-[#20251F] transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          <span>Back to materials</span>
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-lg bg-[#E8F0E7] text-[#315B3B] flex items-center justify-center">
            <Shield size={13} />
          </span>
          <span className="text-xs font-bold text-[#315B3B] uppercase tracking-wider">SPECS Contributor Hub</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#20251F]">Upload Study Resource</h1>
        <p className="text-xs text-[#6B716B] mt-0.5">Share lecture guides, reviewers, and exercises for Gordon College peers</p>
      </div>

      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <X size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-xs font-medium">{error}</p>
          </div>
        )}

        {/* File upload zone */}
        <div>
          <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2.5 block">
            Select Document or File *
          </label>

          {selectedFile ? (
            <div className="bg-[#E8F0E7]/50 border border-[#315B3B]/25 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#315B3B]/20 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
                {getFileEmoji(selectedFile)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#20251F] truncate">{selectedFile.name}</p>
                <p className="text-[11px] font-semibold text-[#315B3B]">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="p-1.5 hover:bg-white rounded-lg text-[#939A92] hover:text-[#20251F] transition-colors"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 bg-[#FFFCF7] border-2 border-dashed border-[#E8E5DE] hover:border-[#315B3B]/50 hover:bg-[#E8F0E7]/20 transition-all rounded-2xl py-10 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-[#E8F0E7] border border-[#E8E5DE] group-hover:border-[#315B3B]/30 flex items-center justify-center transition-all shadow-2xs">
                <Upload size={22} className="text-[#315B3B]" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-[#20251F] group-hover:text-[#315B3B] transition-colors">
                  Click to select file from your device
                </p>
                <p className="text-[11px] text-[#6B716B] mt-1">
                  PDF, DOCX, PPTX, XLSX, TXT, images up to 50MB
                </p>
              </div>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*"
          />
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 block">
            Resource Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Operating Systems — Process Synchronization Notes"
            className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm placeholder:text-[#939A92] focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 block">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of chapters, formulas, or problem sets included..."
            rows={3}
            className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm placeholder:text-[#939A92] focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all outline-none resize-none"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2.5 block">
            Academic Subject *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SUBJECTS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSubject(s)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center truncate ${
                  subject === s
                    ? 'border-[#315B3B] bg-[#E8F0E7] text-[#315B3B] shadow-2xs'
                    : 'border-[#E8E5DE] text-[#6B716B] hover:border-[#315B3B]/30 hover:text-[#20251F]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Link to Session */}
        {sessions.length > 0 && (
          <div>
            <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 block">
              Link to Existing Session (Optional)
            </label>
            <div className="relative">
              <BookOpen size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939A92]" />
              <select
                value={linkedSession}
                onChange={(e) => setLinkedSession(e.target.value)}
                className="w-full bg-white border border-[#E8E5DE] rounded-xl pl-11 pr-4 py-2.5 text-[#20251F] text-sm focus:border-[#F26A21] outline-none transition-all"
              >
                <option value="">No session link (standalone library material)</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    Session: {s.title}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-[#6B716B] mt-1.5">
              Linking connects this document directly to that tutoring session's detail page.
            </p>
          </div>
        )}

        {/* Public Notice */}
        <div className="bg-[#E8F0E7] border border-[#315B3B]/20 rounded-xl p-3.5 flex items-center gap-3">
          <Shield size={16} className="text-[#315B3B] flex-shrink-0" />
          <p className="text-xs text-[#24452D] font-medium leading-relaxed">
            This material will be published to the open Gordon College student resource repository under the SPECS Academic Initiative.
          </p>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !title || !subject || !selectedFile}
          className="w-full bg-[#F26A21] hover:bg-[#D95416] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-xs hover:shadow flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Uploading file to repository...</span>
          ) : (
            <>
              <FileText size={16} />
              <span>Publish Study Material</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}