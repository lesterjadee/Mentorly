'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Upload, X, FileText,
  Shield, AlertCircle, BookOpen
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
  }, [])

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
        <div className="w-5 h-5 border-2 border-[#26619C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isSpecsMember) {
    return (
      <div className="max-w-lg">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
          <h2 className="font-bold text-lg mb-2">SPECS Members Only</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-5">
            Only SPECS members can upload study materials. If you're a SPECS member,
            please contact an officer to update your account.
          </p>
          <Link
            href="/dashboard/materials"
            className="text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors"
          >
            Browse existing materials
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/materials" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield size={14} className="text-[#4a8fd4]" />
            <span className="text-[11px] text-[#4a8fd4] font-semibold uppercase tracking-wider">
              SPECS Member
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Upload study material</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Share a reviewer, notes, or reference for all Gordon College students
          </p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-6">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
            <X size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* file upload */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">
            File *
          </label>

          {selectedFile ? (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">
                {getFileEmoji(selectedFile)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">{selectedFile.name}</p>
                <p className="text-xs text-white/30">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 bg-white/3 border-2 border-dashed border-white/15 hover:border-[#26619C]/40 hover:bg-[#26619C]/3 transition-all rounded-xl py-10 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-[#26619C]/10 border border-white/10 group-hover:border-[#26619C]/20 flex items-center justify-center transition-all">
                <Upload size={20} className="text-white/20 group-hover:text-[#4a8fd4] transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white/40 group-hover:text-white/70 transition-colors font-medium">
                  Click to choose a file
                </p>
                <p className="text-xs text-white/20 mt-1">
                  PDF, DOCX, PPTX, images · Max 50MB
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

        {/* title */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
            Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Differential Calculus Reviewer — Finals"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
          />
        </div>

        {/* description */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
            Description — optional
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's covered? What level is it for? Any important notes?"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
          />
        </div>

        {/* subject */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">
            Subject *
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={
                  'py-2 px-2 rounded-xl border text-xs font-medium transition-all text-center ' +
                  (subject === s
                    ? 'border-[#26619C]/60 bg-[#26619C]/10 text-[#4a8fd4]'
                    : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/70')
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* link to session */}
        {sessions.length > 0 && (
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
              Link to one of your sessions — optional
            </label>
            <div className="relative">
              <BookOpen size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <select
                value={linkedSession}
                onChange={(e) => setLinkedSession(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors appearance-none"
              >
                <option value="" className="bg-[#080C14]">
                  No session link (standalone material)
                </option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#080C14]">
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-white/20 mt-1.5">
              Linking lets students find this material from the session detail page.
            </p>
          </div>
        )}

        {/* notice */}
        <div className="bg-[#26619C]/5 border border-[#26619C]/15 rounded-xl px-4 py-3 flex items-start gap-3">
          <Shield size={13} className="text-[#4a8fd4] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/40 leading-relaxed">
            This material will be{' '}
            <span className="text-white/70 font-medium">publicly available</span> to all
            Gordon College students — no payment needed to download.
          </p>
        </div>

        {/* preview */}
        {selectedFile && title && subject && (
          <div className="bg-white/3 border border-white/8 rounded-xl p-4">
            <p className="text-[10px] text-white/20 uppercase tracking-wider mb-3">Preview</p>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-base flex-shrink-0">
                {getFileEmoji(selectedFile)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/80 truncate">{title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] text-white/30 border border-white/8 px-2 py-0.5 rounded-full">
                    {subject}
                  </span>
                  <span className="text-[10px] text-white/20">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Shield size={9} className="text-[#4a8fd4]" />
                <span className="text-[10px] text-[#4a8fd4]">SPECS</span>
              </div>
            </div>
          </div>
        )}

        {/* submit */}
        <button
          onClick={handleUpload}
          disabled={loading || !title || !subject || !selectedFile}
          className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-40 disabled:cursor-not-allowed transition-colors py-3.5 rounded-xl text-white text-sm font-bold"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FileText size={15} />
              Upload material
            </span>
          )}
        </button>
      </div>
    </div>
  )
}