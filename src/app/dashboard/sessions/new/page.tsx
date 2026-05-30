'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Calendar, Clock, Shield,
  FileText, Upload, X, Users, AlertCircle
} from 'lucide-react'

const SUBJECTS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'Programming', 'Web Development', 'English', 'Filipino', 'History',
  'Accounting', 'Economics', 'Other'
]

const SESSION_TYPES = [
  { value: 'tutoring', label: 'Tutoring', desc: 'One-on-one or small group learning' },
  { value: 'workshop', label: 'Workshop', desc: 'Hands-on activity-based session' },
  { value: 'review', label: 'Review Session', desc: 'Exam prep and topic review' },
  { value: 'consultation', label: 'Consultation', desc: 'Q&A and guidance session' },
]

export default function NewSessionPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSpecsMember, setIsSpecsMember] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string>('')

  // form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [sessionType, setSessionType] = useState('tutoring')
  const [mode, setMode] = useState<'online' | 'in-person' | 'both'>('online')
  const [maxParticipants, setMaxParticipants] = useState('20')
  const [dateType, setDateType] = useState<'single' | 'multi'>('single')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState('1')

  // study material
  const [materialTitle, setMaterialTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkAccess() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('users')
        .select('is_specs_member')
        .eq('id', user.id)
        .single()

      setIsSpecsMember(profile?.is_specs_member || false)
    }
    checkAccess()
  }, [])

  function countDays() {
    if (!startDate || !endDate) return 1
    const s = new Date(startDate), e = new Date(endDate)
    if (e < s) return 1
    return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  function formatEndTime(t: string, h: string) {
    if (!t || !h) return ''
    const [hh, mm] = t.split(':').map(Number)
    const total = hh * 60 + mm + parseFloat(h) * 60
    const eh = Math.floor(total / 60) % 24, em = total % 60
    const p = (x: number) => x >= 12 ? 'PM' : 'AM'
    const f = (x: number) => x % 12 === 0 ? 12 : x % 12
    return f(hh) + ':' + String(mm).padStart(2,'0') + ' ' + p(hh) + ' – ' + f(eh) + ':' + String(em).padStart(2,'0') + ' ' + p(eh)
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be under 50MB.')
      return
    }
    setSelectedFile(file)
    if (!materialTitle) setMaterialTitle(file.name.replace(/\.[^.]+$/, ''))
  }

  async function handleSubmit() {
    if (!title || !subject || !startDate || !startTime) {
      setError('Please fill in all required fields.')
      return
    }
    if (dateType === 'multi' && !endDate) {
      setError('Please select an end date.')
      return
    }
    if (selectedFile && !materialTitle) {
      setError('Please enter a title for the study material.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const totalDays = dateType === 'single' ? 1 : countDays()
    const finalEndDate = dateType === 'single' ? startDate : endDate

    // 1 — create session
    const { data: sessionData, error: sessionError } = await supabase
      .from('services')
      .insert({
        tutor_id: userId,
        title,
        description,
        category: subject,
        price_per_hour: 0,
        mode,
        is_active: true,
        is_free: true,
        session_type: sessionType,
        start_date: startDate,
        end_date: finalEndDate,
        daily_start_time: startTime,
        hours_per_day: parseFloat(hoursPerDay),
        total_days: totalDays,
        max_participants: parseInt(maxParticipants),
        scheduled_at: new Date(startDate + 'T' + startTime).toISOString(),
      })
      .select()
      .single()

    if (sessionError || !sessionData) {
      setError(sessionError?.message || 'Failed to create session.')
      setLoading(false)
      return
    }

    // 2 — upload study material if provided
    if (selectedFile) {
      setUploadingFile(true)
      const ext = selectedFile.name.split('.').pop()
      const filePath = userId + '/' + sessionData.id + '/' + Date.now() + '.' + ext

      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, selectedFile)

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('study-materials')
          .getPublicUrl(filePath)

        await supabase.from('study_materials').insert({
          uploaded_by: userId,
          session_id: sessionData.id,
          title: materialTitle,
          subject,
          description: 'Study material for: ' + title,
          file_url: urlData.publicUrl,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
        })
      }
      setUploadingFile(false)
    }

    router.push('/dashboard/sessions?posted=true')
  }

  // loading state while checking access
  if (isSpecsMember === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#26619C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // access denied for non-SPECS
  if (!isSpecsMember) {
    return (
      <div className="max-w-lg">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
          <h2 className="font-bold text-lg mb-2">SPECS Members Only</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-5">
            Only SPECS members can post sessions. If you're a SPECS member, please contact an officer to update your account.
          </p>
          <Link href="/dashboard/sessions" className="text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors">
            Browse existing sessions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/sessions" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield size={14} className="text-[#4a8fd4]" />
            <span className="text-[11px] text-[#4a8fd4] font-semibold uppercase tracking-wider">SPECS Member</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Post a session</h1>
          <p className="text-white/40 text-sm mt-0.5">Share your knowledge with fellow Gordon College students</p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-6">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
            <X size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* session type */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Session type *</label>
          <div className="grid grid-cols-2 gap-2">
            {SESSION_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSessionType(t.value)}
                className={
                  'p-3 rounded-xl border text-left transition-all ' +
                  (sessionType === t.value
                    ? 'border-[#26619C]/60 bg-[#26619C]/10'
                    : 'border-white/8 bg-white/3 hover:border-white/20')
                }
              >
                <p className={'text-xs font-semibold mb-0.5 ' + (sessionType === t.value ? 'text-[#4a8fd4]' : 'text-white/70')}>
                  {t.label}
                </p>
                <p className="text-[10px] text-white/30">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* title */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Session title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Basic Calculus — Derivatives and Integrals"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
          />
        </div>

        {/* description */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will students learn? What topics will be covered? What's the expected level?"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors resize-none"
          />
        </div>

        {/* subject + mode */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Subject *</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors appearance-none"
            >
              <option value="" disabled className="bg-[#080C14]">Select subject</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s} className="bg-[#080C14]">{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Mode</label>
            <div className="flex flex-col gap-1.5">
              {(['online', 'in-person', 'both'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={
                    'px-3 py-2 rounded-lg border text-xs font-medium transition-all capitalize ' +
                    (mode === m
                      ? 'border-[#26619C]/60 bg-[#26619C]/10 text-[#4a8fd4]'
                      : 'border-white/8 text-white/40 hover:border-white/20')
                  }
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* max participants */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Users size={12} /> Max participants
          </label>
          <div className="flex gap-2">
            {['5', '10', '20', '30', '50'].map((n) => (
              <button
                key={n}
                onClick={() => setMaxParticipants(n)}
                className={
                  'flex-1 py-2 rounded-xl border text-xs font-medium transition-all ' +
                  (maxParticipants === n
                    ? 'border-[#26619C]/60 bg-[#26619C]/10 text-[#4a8fd4]'
                    : 'border-white/8 text-white/40 hover:border-white/20')
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* schedule */}
        <div className="border-t border-white/8 pt-6">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-4">Schedule *</p>

          {/* single/multi toggle */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['single', 'multi'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setDateType(t)}
                className={
                  'py-2.5 rounded-xl border text-xs font-semibold transition-all ' +
                  (dateType === t
                    ? 'border-[#26619C]/60 bg-[#26619C]/10 text-[#4a8fd4]'
                    : 'border-white/8 text-white/40 hover:border-white/20')
                }
              >
                {t === 'single' ? 'Single day' : 'Multiple days'}
              </button>
            ))}
          </div>

          {/* dates */}
          {dateType === 'single' ? (
            <div className="mb-4">
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={11} /> Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setEndDate(e.target.value) }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={11} /> Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={11} /> End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
                />
              </div>
            </div>
          )}

          {/* time + hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock size={11} /> Start time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#26619C]/60 transition-colors"
              />
              {startTime && hoursPerDay && (
                <p className="text-xs text-[#4a8fd4] mt-1.5">{formatEndTime(startTime, hoursPerDay)}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                Hours per day
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['1', '1.5', '2', '3'].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHoursPerDay(h)}
                    className={
                      'py-3 rounded-xl border text-xs font-medium transition-all ' +
                      (hoursPerDay === h
                        ? 'border-[#26619C]/60 bg-[#26619C]/10 text-[#4a8fd4]'
                        : 'border-white/8 text-white/40 hover:border-white/20')
                    }
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* study material upload */}
        <div className="border-t border-white/8 pt-6">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-2">
            Attach a study material — optional
          </p>
          <p className="text-xs text-white/20 mb-4 leading-relaxed">
            Upload a reviewer, notes, or reference material. Students can download it even without booking the session.
          </p>

          {selectedFile ? (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/70 truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-white/30">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                  Material title *
                </label>
                <input
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="e.g. Calculus Reviewer — Derivatives"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors"
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 bg-white/3 border border-dashed border-white/15 hover:border-white/30 hover:bg-white/5 transition-all rounded-xl py-6 cursor-pointer"
            >
              <Upload size={20} className="text-white/20" />
              <p className="text-xs text-white/30">Click to upload file</p>
              <p className="text-[10px] text-white/15">PDF, DOCX, PPTX, images — max 50MB</p>
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

        {/* free badge */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <Shield size={13} className="text-green-400" />
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            This session is <span className="text-green-400 font-semibold">completely free</span> — no payments, no fees. SPECS provides this as a service to the Gordon College community.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#26619C] hover:bg-[#1e4f82] disabled:opacity-50 transition-colors py-3.5 rounded-xl text-white text-sm font-bold"
        >
          {loading
            ? (uploadingFile ? 'Uploading materials...' : 'Posting session...')
            : 'Post session'}
        </button>
      </div>
    </div>
  )
}